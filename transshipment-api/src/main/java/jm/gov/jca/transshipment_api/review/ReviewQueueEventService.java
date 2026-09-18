package jm.gov.jca.transshipment_api.review;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

// Decided on using server sent events (SSE) to update the reviewer table whenever a request is under review
@Service
public class ReviewQueueEventService {
    
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // Creating a communication channel for the reviewer
    public SseEmitter subscribe() {

        // 0L means i'm not asking spring to timeout the connection after a fixed period
        SseEmitter emitter = new SseEmitter(0L);

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));

        try {
            emitter.send(
                SseEmitter.event()
                    .name("connected")
                    .data("CONNECTED")
            );
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    // This goes through every connected reviewer and tells it to reload the queue
    public void notifyQueueChanged() {
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(
                    SseEmitter.event()
                        .name("review-queue-changed")
                        .data("REVIEW_QUEUE_CHANGED")
                );
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    // Realized that old submitted values can still be loaded -
    // if a database transaction hasn't committed yet.
    // So SSE causes the reload but the old data is still being reloaded
    // This function sends the notif after the transaction successfully commits.
    public void notifyQueueChangedAfterCommit() {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        notifyQueueChanged();
                    }
                }
            );
        } else {
            notifyQueueChanged();
        }
    }
}

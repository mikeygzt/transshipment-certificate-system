import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ReviewQueueEventService {

    listenForQueueChange(): Observable<void> {
        return new Observable<void>((subscriber) => {

            const eventSource = new EventSource("/api/reviewer/review-queue/events");

            eventSource.addEventListener(
                "connected",
                () => {
                    console.log("Connected to review queue updates.");
                }
            )

            eventSource.addEventListener(
                "review-queue-changed",
                () => {
                    console.log("Review queue changed.");
                    subscriber.next();
                }
            )

            eventSource.onerror = (error) => {
                console.log("Review queue SSE error: ", error);
            }

            return () => {
                eventSource.close();
            }
        });
    }
}
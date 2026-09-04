package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.time.Year;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class CertificateControlNumberService {
    
    @PersistenceContext
    private EntityManager entityManager;

    public String generateControlNumber() {
        Number sequenceValue = (Number) entityManager

            // Gets the next unique number from postgres
            .createNativeQuery("SELECT nextVal('transshipment_certificate_control_seq')")
            .getSingleResult();
        
        int year = Year.now().getValue();

        return "JCA-TSC-%d-%06d".formatted(year, sequenceValue.longValue());
    }
}

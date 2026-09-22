package jm.gov.jca.transshipment_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling 
public class TransshipmentApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TransshipmentApiApplication.class, args);
	}

}

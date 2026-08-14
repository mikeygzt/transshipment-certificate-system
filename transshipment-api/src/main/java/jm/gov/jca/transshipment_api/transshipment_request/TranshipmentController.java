package jm.gov.jca.transshipment_api.transshipment_request;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsRequest;
import jm.gov.jca.transshipment_api.transshipment_request.dto.TransshipmentDetailsResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




@RestController
@RequestMapping("api/transshipmentrequest")
public class TranshipmentController {
    
    private final TransshipmentService transshipmentService;

    public TranshipmentController(TransshipmentService transshipmentService){
        this.transshipmentService = transshipmentService;
    }

    @PostMapping("/new")
    public TransshipmentDetailsResponse createRequest(@Valid @RequestBody TransshipmentDetailsRequest request) {
        //Direct to the request method in transhipment service
    
        return transshipmentService.createRequest(request);
    }

    @GetMapping("/all")
    public List<TransshipmentDetailsResponse> getAllRequests() {
        //let a reviewer get all the requests in the system
        return transshipmentService.getAllRequests();
    }

    @GetMapping("/my-applications/{id}")
    public List<TransshipmentDetailsResponse> getUserRequests(@PathVariable UUID id) {
        return transshipmentService.getUserRequests(id);
    }

    @GetMapping("/{id}")
    public TransshipmentDetailsResponse getRequest(@PathVariable UUID id) {
        return transshipmentService.getRequest(id);
    }
    
    

    @PatchMapping("/update/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void updateRequest(@PathVariable UUID id, @Valid @RequestBody TransshipmentDetailsRequest request) {
        //better to add on the id of the request then the new request
        transshipmentService.updateRequest(id, request);
    }

    

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransshipmentRequest(@PathVariable UUID id){
        transshipmentService.deleteRequest(id);
    }
    
    


    
}

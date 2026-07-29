package jm.gov.jca.transshipment_api.transshipment_request;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




@RestController
public class TranshipmentController {
    
    private final TransshipmentService transshipmentService;

    public TranshipmentController(TransshipmentService transshipmentService){
        this.transshipmentService = transshipmentService;
    }

    @PostMapping("api/")
    public String createRequest(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }

    @GetMapping("api/get")
    public String getAllRequests(@RequestParam String param) {
        return new String();
    }

    @PutMapping("path/{id}")
    @ResponseStatus(HttpStatus.OK)
    public String putMethodName(@PathVariable String id, @RequestBody String entity) {
        //TODO: process PUT request
        
        return entity;
    }

    @DeleteMapping("api/delete{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransshipmentRequest(@PathVariable Long id){
        transshipmentService.deleteRequest(id);
    }
    
    


    
}

package jm.gov.jca.transshipment_api.user;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jm.gov.jca.transshipment_api.user.dto.AdminCreateUserRequest;
import jm.gov.jca.transshipment_api.user.dto.AdminUpdateUserRequest;
import jm.gov.jca.transshipment_api.user.dto.UserResponse;

@RestController
@RequestMapping("/api/admin/users")
public class UserAdminController {
    private final UserService userService;

    public UserAdminController(UserService userService){
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(
        @Valid
        @RequestBody
        AdminCreateUserRequest request) {
            return userService.createByAdmin(request);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id, Authentication authentication) {
        userService.deleteUser(id, authentication);
    }

    @PatchMapping("/{id}")
    public UserResponse updateUser(
        @PathVariable UUID id,
        @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        return userService.updateUser(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public UserResponse deactivateUser(
        @PathVariable UUID id,
        Authentication authentication
    ) {
        return userService.deactivateUser(id, authentication);
    }
}

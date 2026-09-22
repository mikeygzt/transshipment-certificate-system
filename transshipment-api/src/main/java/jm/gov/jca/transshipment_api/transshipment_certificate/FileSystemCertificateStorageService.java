package jm.gov.jca.transshipment_api.transshipment_certificate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FileSystemCertificateStorageService implements CertificateStorageService {
    
    private final Path rootDirectory;

    public FileSystemCertificateStorageService(
        @Value("${certificate.storage.root:certificate-storage}")
        String storageRoot
    ) {
        this.rootDirectory = Paths.get(storageRoot).toAbsolutePath().normalize();

        try {
            Files.createDirectories(rootDirectory);
        } catch (IOException e) {
            throw new IllegalStateException(
                "Could not initalize certificate storage.",
                e
            );
        }
    }

    @Override
    public String store(String fileKey, byte[] pdfBytes) {
        Path targetPath = resolveSafePath(fileKey);

        try {
            Files.createDirectories(targetPath.getParent());

            Files.write(targetPath, pdfBytes, StandardOpenOption.CREATE_NEW);

            return fileKey;
        } catch (IOException e) {
            throw new IllegalStateException(
                "Could not store certificate PDF.",
                e
            );
        }
    }

    @Override
    public byte[] load(String fileKey) {
        Path targetPath = resolveSafePath(fileKey);

        try {
            return Files.readAllBytes(targetPath);
        } catch (IOException e) {
            throw new IllegalStateException(
                "Could not load certificate PDF.",
                e
            );
        }
    }

    private Path resolveSafePath(String fileKey) {
        Path targetPath = rootDirectory.resolve(fileKey).normalize();

        if (!targetPath.startsWith(rootDirectory)) {
            throw new IllegalArgumentException(
                "Invalid certificate file key."
            );
        }

        return targetPath;
    }
}

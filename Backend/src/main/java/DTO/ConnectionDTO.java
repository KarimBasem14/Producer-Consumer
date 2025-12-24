package DTO;

public class ConnectionDTO {
    int fromId;
    int toId;
    int connectionType; // 0 --> from machine to queue.
                        // 1 --> from queue to machine
}

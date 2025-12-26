package com.lab.backend.Controller;

import com.lab.backend.DTO.ConnectionDTO;
import com.lab.backend.DTO.MachineDTO;
import com.lab.backend.DTO.QueueDTO;
import com.lab.backend.Service.LayoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class LayoutController {

    @Autowired
    private LayoutService layoutService;

    // queues
    @PostMapping("/queues/add")
    public ResponseEntity<QueueDTO> addQueue(@RequestBody QueueDTO queueDTO) {
        QueueDTO q = layoutService.addQueue(queueDTO);
        return ResponseEntity.ok(q);
    }

    @DeleteMapping("/queues/delete/{id}")
    public ResponseEntity<String> deleteQueue(@PathVariable Long id) {
        layoutService.removeQueue(id);
        return ResponseEntity.ok("Queue removed");
    }

    @PutMapping("/queues/update")
    public ResponseEntity<String> updateQueue(@RequestBody QueueDTO queueDTO) {
        layoutService.updateQueue(queueDTO);
        return ResponseEntity.ok("Queue Updated");
    }

    // machines
    @PostMapping("/machines/add")
    public ResponseEntity<MachineDTO> addMachine(@RequestBody MachineDTO machineDTO) {
        MachineDTO machine = layoutService.addMachine(machineDTO);
        return ResponseEntity.ok(machine);
    }

    @DeleteMapping("/machines/delete/{id}")
    public ResponseEntity<String> deleteMachine(@PathVariable Long id) {
        layoutService.removeMachine(id);
        return ResponseEntity.ok("Machine removed");
    }

    @PutMapping("/machines/update")
    public ResponseEntity<String> updateMachine(@RequestBody MachineDTO machineDTO) {
        layoutService.updateMachine(machineDTO);
        return ResponseEntity.ok("Machine updated");
    }

    // connections
    @PostMapping("/connections/add")
    public ResponseEntity<String> connect(@RequestBody ConnectionDTO connection) {
        // Validates that Ms and Qs are connected appropriately
        layoutService.createConnection(connection);
        return ResponseEntity.ok("Connection established");
    }

    @DeleteMapping("/connections/delete/{id}")
    public ResponseEntity<String> disconnect(@PathVariable Long id) {
        layoutService.removeConnection(id);
        return ResponseEntity.ok("Connection removed");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearAll() {
        layoutService.reset();
        return ResponseEntity.ok("Canvas cleared");
    }

}

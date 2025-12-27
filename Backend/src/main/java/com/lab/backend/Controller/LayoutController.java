package com.lab.backend.Controller;

import com.lab.backend.DTO.ConnectionDTO;
import com.lab.backend.DTO.MachineDTO;
import com.lab.backend.DTO.QueueDTO;
import com.lab.backend.Service.LayoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@RequestMapping("/layout")
public class LayoutController {

    @Autowired
    private LayoutService layoutService;

    @PostMapping("/products/add")
    public ResponseEntity<Integer> addQueue(@RequestBody int number) {
        int num = layoutService.setProductsNumber(number);
        return ResponseEntity.ok(num);
    }

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
    public ResponseEntity<ConnectionDTO> connect(@RequestBody ConnectionDTO connection) {
        // Validates that Ms and Qs are connected appropriately
        ConnectionDTO createdConnection = layoutService.createConnection(connection);
        return ResponseEntity.ok(createdConnection);
    }

    @DeleteMapping("/connections/delete/{id}")
    public ResponseEntity<Void> disconnect(@PathVariable Long id) {
        layoutService.removeConnection(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearAll() {
        layoutService.reset();
        return ResponseEntity.ok("Canvas cleared");
    }

}

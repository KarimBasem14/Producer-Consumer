package com.lab.backend.Controller;


import com.lab.backend.DTO.QueueDTO;
import com.lab.backend.DTO.UIStateDTO;
import com.lab.backend.Service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/simulation")
public class SimulationController {

    @Autowired
    private SimulationService simulationService;

    @PostMapping("/start")
    public ResponseEntity<String> startSimulation() {
        simulationService.start();
        return ResponseEntity.ok("Simulation Started");
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetSimulation() {
        simulationService.resetSimulation();
        return ResponseEntity.ok("Simulation and layout reset");
    }

    @GetMapping("/state")
    public ResponseEntity<UIStateDTO> getCurrentState() {
        return ResponseEntity.ok(simulationService.getCurrentState());
    }

    @PostMapping("/replay")
    public ResponseEntity<String> replaySimulation() {
        try {
            simulationService.replay();
            return ResponseEntity.ok("Replay finished");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.internalServerError().body("Replay interrupted");
        }
    }
}

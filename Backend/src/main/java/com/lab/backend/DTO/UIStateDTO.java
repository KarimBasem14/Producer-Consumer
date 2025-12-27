package com.lab.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UIStateDTO {
    public Map<Long, Integer> queuesSize = new HashMap<>();
    public Map<Long, String> machinesColor = new HashMap<>();
    public boolean isFinished = false;
}

package Database;

import DTO.MachineDTO;
import DTO.QueueDTO;

import java.util.HashMap;
import java.util.Map;

public class Database {

    public Database database = null;
    // should they be private !!
    public Map<String, MachineDTO> machines = new HashMap<>();
    public Map<String, QueueDTO> queues = new HashMap<>();
    public int numOfProducts;


    // should we make this synchronized ??
    Database getInstance(){
        if(database == null){
            database = new Database();
        }
        return database;
    }
}

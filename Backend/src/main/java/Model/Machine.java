package Model;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


public class Machine implements Runnable {
    private List<Queue> inputQueues = new ArrayList<Queue>();
    @Setter
    private Queue outputQueue;
    private int processingTime;

    public Machine(int processingTime) {
        this.processingTime = processingTime;
    }

    public void addToInputQueue(Queue inputQueue) {
        inputQueues.add(inputQueue);
    }


    public void run() {}
}

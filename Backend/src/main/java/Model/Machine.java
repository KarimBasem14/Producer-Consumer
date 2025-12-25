package Model;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


public class Machine implements Runnable {
    private List<Queue> inputQueues = new ArrayList<Queue>();
    @Setter
    private Queue outputQueue;
    private int processingTime;
    @Getter
    @Setter
    private Product currentProduct;

    public Machine(int processingTime) {
        this.processingTime = processingTime;
    }

    public void addToInputQueue(Queue inputQueue) {
        inputQueues.add(inputQueue);
    }


    public void run() {}
}

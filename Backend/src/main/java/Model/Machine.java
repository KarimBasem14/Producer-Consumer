package Model;
import Observer.Observer;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


public class Machine implements Runnable, Observer {
    private List<Queue> inputQueues = new ArrayList<Queue>();
    @Setter
    private Queue outputQueue;
    private int processingTime;
    private int currentQueueIndex = 0;

    @Setter
    @Getter
    private Product currentProduct;

    private boolean running = true;

    public Machine(int processingTime) {
        this.processingTime = processingTime;
    }

    public void addToInputQueue(Queue inputQueue) {
        inputQueues.add(inputQueue);
    }

    @Override
    public void run() {
        while (running) {
            Product product = fetchNextProduct();
            if (product != null) {
                unregisterFromAllInQueues();
                process(product);
                outputQueue.addProduct(product);
                setCurrentProduct(null);
            }
            else {
                registerToAllInQueues();
                waitForNotification();
            }
        }
    }

    @Override
    public void update() {
        synchronized (this){
            this.notify();
        }
    }

    private Product fetchNextProduct() {
        for (int i = 0; i < inputQueues.size(); i++) {
            Queue q = inputQueues.get(currentQueueIndex);
            Product product = q.pollProduct();

            currentQueueIndex = (currentQueueIndex + 1) % inputQueues.size();


            if  (product != null) {
                return product;
            }

        }
        return null;
    }

    private void process(Product product) {
        try {
            Thread.sleep(this.processingTime);
        }catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    private void registerToAllInQueues() {
        for (Queue q : inputQueues) {
            q.registerObserver(this);
        }
    }

    private void unregisterFromAllInQueues() {
        for (Queue q : inputQueues) {
            q.removeObserver(this);
        }
    }


    private synchronized void waitForNotification() {
        try {
            this.wait();
        }catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

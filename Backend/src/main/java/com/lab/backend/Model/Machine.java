package com.lab.backend.Model;
import com.lab.backend.Observer.Observer;
import com.lab.backend.Service.SimulationEventListener;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


public class Machine implements Runnable, Observer {
    @Getter
    private List<Queue> inputQueues = new ArrayList<>();
    @Setter
    @Getter
    private Queue outputQueue;
    private int processingTime;
    private int currentQueueIndex = 0;

    @Setter
    @Getter
    private Product currentProduct;

    private final SimulationEventListener listener;

    private volatile boolean running = true;

    public Machine(int processingTime, SimulationEventListener listener) {
        this.processingTime = processingTime;
        this.listener = listener;
    }

    public void addToInputQueue(Queue inputQueue) {
        inputQueues.add(inputQueue);
    }

    public boolean isReady() {
        return outputQueue != null && !inputQueues.isEmpty();
    }

    private void log(String msg) {
        System.out.println(
                "[Thread=" + Thread.currentThread().getName() +
                        ", Machine@" + System.identityHashCode(this) + "] " + msg
        );
    }
    public void shutdown() {
        running = false;
    }

    @Override
    public void run() {
        log("RUN START");
        while (running) {
            Product product = fetchNextProduct();
            if (product != null) {
                // BUG FIX: Commented out sleep to prevent race condition
                // The sleep here caused a window where:
                // 1. Machine fetched product but hasn't set currentProduct yet
                // 2. Completion check runs and sees currentProduct == null (idle)
                // 3. Marks simulation complete BEFORE product is processed
                // 4. Product gets lost or duplicated
                // 
                // ORIGINAL CODE (BUGGY):
                // try {
                //     Thread.sleep(200);
                // } catch (InterruptedException e) {
                //     Thread.currentThread().interrupt();
                // }
                
                // Now we set currentProduct IMMEDIATELY after fetching
                // This ensures completion check sees the machine as busy
                setCurrentProduct(product);
                stateChanged();
                unregisterFromAllInQueues();
                process(product);
                outputQueue.addProduct(product);
                setCurrentProduct(null);
                stateChanged();
                try {
                    Thread.sleep(210);
                }
                catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
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
            long delay = (long)(this.processingTime * 1000 / com.lab.backend.Service.SimulationService.speedMultiplier);
            Thread.sleep(delay);
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

    private void stateChanged() {
        listener.onStateChanged();
    }
}

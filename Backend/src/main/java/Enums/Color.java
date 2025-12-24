package Enums;

public enum Color {
    RED(1),
    GREEN(2),
    BLUE(3),
    YELLOW(4),
    BLACK(5),
    WHITE(6);

    private final int value;

    Color(int i) {
        this.value = i;
    }

    public int getValue() {return value;}

    public static Color fromValue(int value) {
        for (Color p : Color.values()) {
            if (p.value == value) return p;
        }
        throw new IllegalArgumentException("Invalid Color: " + value);
    }
}
package com.pcworkshop.service;

import com.pcworkshop.dto.SimulationResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class MonospaceRasterizer {
    private static final int GLYPH_WIDTH = 6; // Five pixels plus one column of spacing.
    private static final int GLYPH_HEIGHT = 8; // Seven glyph rows plus one blank row.
    private static final char FALLBACK_CHARACTER = '?';
    private static final Map<Character, String[]> FONT = createFont();

    public SimulationResponse.Rasterization rasterize(String text) {
        int characterCount = text.codePointCount(0, text.length());
        int width = characterCount * GLYPH_WIDTH;
        char[][] grid = new char[GLYPH_HEIGHT][width];
        for (char[] row : grid) {
            java.util.Arrays.fill(row, '0');
        }

        List<SimulationResponse.RasterGlyph> glyphs = new ArrayList<>(characterCount);
        int glyphIndex = 0;
        for (int offset = 0; offset < text.length();) {
            int codePoint = text.codePointAt(offset);
            char original = Character.isBmpCodePoint(codePoint) ? (char) codePoint : '\uFFFD';
            String[] pattern = codePoint <= Character.MAX_VALUE ? FONT.get((char) codePoint) : null;
            boolean fallback = pattern == null;
            char rendered = fallback ? FALLBACK_CHARACTER : original;
            if (fallback) {
                pattern = FONT.get(FALLBACK_CHARACTER);
            }

            int xOffset = glyphIndex * GLYPH_WIDTH;
            for (int y = 0; y < pattern.length; y++) {
                for (int x = 0; x < pattern[y].length(); x++) {
                    if (pattern[y].charAt(x) == '1') {
                        grid[y][xOffset + x] = '1';
                    }
                }
            }
            glyphs.add(new SimulationResponse.RasterGlyph(
                    new String(Character.toChars(codePoint)), String.valueOf(rendered), fallback));

            glyphIndex++;
            offset += Character.charCount(codePoint);
        }

        StringBuilder pixels = new StringBuilder(width * GLYPH_HEIGHT);
        for (char[] row : grid) {
            pixels.append(row);
        }
        return new SimulationResponse.Rasterization(
                width, GLYPH_HEIGHT, GLYPH_WIDTH, GLYPH_HEIGHT, pixels.toString(), glyphs);
    }

    private static Map<Character, String[]> createFont() {
        Map<Character, String[]> font = new HashMap<>();
        add(font, 'A', "01110/10001/10001/11111/10001/10001/10001");
        add(font, 'B', "11110/10001/10001/11110/10001/10001/11110");
        add(font, 'C', "01111/10000/10000/10000/10000/10000/01111");
        add(font, 'D', "11110/10001/10001/10001/10001/10001/11110");
        add(font, 'E', "11111/10000/10000/11110/10000/10000/11111");
        add(font, 'F', "11111/10000/10000/11110/10000/10000/10000");
        add(font, 'G', "01111/10000/10000/10111/10001/10001/01111");
        add(font, 'H', "10001/10001/10001/11111/10001/10001/10001");
        add(font, 'I', "11111/00100/00100/00100/00100/00100/11111");
        add(font, 'J', "00111/00010/00010/00010/10010/10010/01100");
        add(font, 'K', "10001/10010/10100/11000/10100/10010/10001");
        add(font, 'L', "10000/10000/10000/10000/10000/10000/11111");
        add(font, 'M', "10001/11011/10101/10101/10001/10001/10001");
        add(font, 'N', "10001/11001/10101/10011/10001/10001/10001");
        add(font, 'O', "01110/10001/10001/10001/10001/10001/01110");
        add(font, 'P', "11110/10001/10001/11110/10000/10000/10000");
        add(font, 'Q', "01110/10001/10001/10001/10101/10010/01101");
        add(font, 'R', "11110/10001/10001/11110/10100/10010/10001");
        add(font, 'S', "01111/10000/10000/01110/00001/00001/11110");
        add(font, 'T', "11111/00100/00100/00100/00100/00100/00100");
        add(font, 'U', "10001/10001/10001/10001/10001/10001/01110");
        add(font, 'V', "10001/10001/10001/10001/10001/01010/00100");
        add(font, 'W', "10001/10001/10001/10101/10101/10101/01010");
        add(font, 'X', "10001/10001/01010/00100/01010/10001/10001");
        add(font, 'Y', "10001/10001/01010/00100/00100/00100/00100");
        add(font, 'Z', "11111/00001/00010/00100/01000/10000/11111");

        // Polish uppercase letters. Accents and ogoneks are drawn within the same 5x7 cell.
        add(font, 'Ą', "01110/10001/10001/11111/10001/10001/00001");
        add(font, 'Ć', "00100/01110/10001/10000/10000/10001/01110");
        add(font, 'Ę', "11111/10000/10000/11110/10000/11111/00001");
        add(font, 'Ł', "10001/10010/10100/11000/10000/10000/11111");
        add(font, 'Ń', "00010/10001/11001/10101/10011/10001/10001");
        add(font, 'Ó', "00010/01110/10001/10001/10001/10001/01110");
        add(font, 'Ś', "00100/01111/10000/01110/00001/00001/11110");
        add(font, 'Ź', "00010/11111/00001/00010/00100/01000/11111");
        add(font, 'Ż', "00100/11111/00001/00010/00100/01000/11111");

        add(font, 'a', "00000/00000/01110/00001/01111/10001/01111");
        add(font, 'b', "10000/10000/10110/11001/10001/10001/11110");
        add(font, 'c', "00000/00000/01111/10000/10000/10000/01111");
        add(font, 'd', "00001/00001/01101/10011/10001/10001/01111");
        add(font, 'e', "00000/00000/01110/10001/11111/10000/01111");
        add(font, 'f', "00110/01001/01000/11100/01000/01000/01000");
        add(font, 'g', "00000/01111/10001/10001/01111/00001/01110");
        add(font, 'h', "10000/10000/10110/11001/10001/10001/10001");
        add(font, 'i', "00100/00000/01100/00100/00100/00100/01110");
        add(font, 'j', "00010/00000/00110/00010/00010/10010/01100");
        add(font, 'k', "10000/10000/10010/10100/11000/10100/10010");
        add(font, 'l', "01100/00100/00100/00100/00100/00100/01110");
        add(font, 'm', "00000/00000/11010/10101/10101/10101/10101");
        add(font, 'n', "00000/00000/10110/11001/10001/10001/10001");
        add(font, 'o', "00000/00000/01110/10001/10001/10001/01110");
        add(font, 'p', "00000/11110/10001/10001/11110/10000/10000");
        add(font, 'q', "00000/01111/10001/10001/01111/00001/00001");
        add(font, 'r', "00000/00000/10110/11001/10000/10000/10000");
        add(font, 's', "00000/00000/01111/10000/01110/00001/11110");
        add(font, 't', "01000/01000/11100/01000/01000/01001/00110");
        add(font, 'u', "00000/00000/10001/10001/10001/10011/01101");
        add(font, 'v', "00000/00000/10001/10001/10001/01010/00100");
        add(font, 'w', "00000/00000/10001/10001/10101/10101/01010");
        add(font, 'x', "00000/00000/10001/01010/00100/01010/10001");
        add(font, 'y', "00000/10001/10001/10001/01111/00001/01110");
        add(font, 'z', "00000/00000/11111/00010/00100/01000/11111");

        // Polish lowercase letters.
        add(font, 'ą', "01110/00001/01111/10001/01111/00001/00010");
        add(font, 'ć', "00100/00000/01111/10000/10000/10000/01111");
        add(font, 'ę', "00000/01110/10001/11111/10000/01111/00010");
        add(font, 'ł', "00100/01100/00100/00100/00100/00100/01110");
        add(font, 'ń', "00010/00000/10110/11001/10001/10001/10001");
        add(font, 'ó', "00010/00000/01110/10001/10001/10001/01110");
        add(font, 'ś', "00100/00000/01111/10000/01110/00001/11110");
        add(font, 'ź', "00010/00000/11111/00010/00100/01000/11111");
        add(font, 'ż', "00100/00000/11111/00010/00100/01000/11111");

        add(font, '0', "01110/10001/10011/10101/11001/10001/01110");
        add(font, '1', "00100/01100/00100/00100/00100/00100/01110");
        add(font, '2', "01110/10001/00001/00010/00100/01000/11111");
        add(font, '3', "11110/00001/00001/01110/00001/00001/11110");
        add(font, '4', "00010/00110/01010/10010/11111/00010/00010");
        add(font, '5', "11111/10000/10000/11110/00001/00001/11110");
        add(font, '6', "01110/10000/10000/11110/10001/10001/01110");
        add(font, '7', "11111/00001/00010/00100/01000/01000/01000");
        add(font, '8', "01110/10001/10001/01110/10001/10001/01110");
        add(font, '9', "01110/10001/10001/01111/00001/00001/01110");

        add(font, ' ', "00000/00000/00000/00000/00000/00000/00000");
        add(font, '.', "00000/00000/00000/00000/00000/01100/01100");
        add(font, ',', "00000/00000/00000/00000/00110/00110/00100");
        add(font, ':', "00000/01100/01100/00000/01100/01100/00000");
        add(font, ';', "00000/01100/01100/00000/01100/01100/01000");
        add(font, '!', "00100/00100/00100/00100/00100/00000/00100");
        add(font, '?', "01110/10001/00001/00010/00100/00000/00100");
        add(font, '-', "00000/00000/00000/11111/00000/00000/00000");
        add(font, '_', "00000/00000/00000/00000/00000/00000/11111");
        add(font, '+', "00000/00100/00100/11111/00100/00100/00000");
        add(font, '=', "00000/00000/11111/00000/11111/00000/00000");
        add(font, '/', "00001/00010/00010/00100/01000/01000/10000");
        add(font, '\\', "10000/01000/01000/00100/00010/00010/00001");
        add(font, '(', "00010/00100/01000/01000/01000/00100/00010");
        add(font, ')', "01000/00100/00010/00010/00010/00100/01000");
        add(font, '[', "01110/01000/01000/01000/01000/01000/01110");
        add(font, ']', "01110/00010/00010/00010/00010/00010/01110");
        add(font, '\'', "00100/00100/00010/00000/00000/00000/00000");
        add(font, '"', "01010/01010/01010/00000/00000/00000/00000");
        add(font, '#', "01010/11111/01010/01010/11111/01010/00000");
        add(font, '%', "11001/11010/00100/01000/10110/00110/00000");
        add(font, '&', "01100/10010/10100/01000/10101/10010/01101");
        add(font, '*', "00000/10101/01110/11111/01110/10101/00000");
        return Map.copyOf(font);
    }

    private static void add(Map<Character, String[]> font, char character, String rows) {
        String[] pattern = rows.split("/");
        if (pattern.length != 7 || java.util.Arrays.stream(pattern).anyMatch(row -> row.length() != 5)) {
            throw new IllegalArgumentException("Invalid bitmap glyph for '" + character + "'");
        }
        font.put(character, pattern);
    }
}

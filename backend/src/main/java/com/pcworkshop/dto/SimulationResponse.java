package com.pcworkshop.dto;

import java.util.List;

public record SimulationResponse(
        String text,
        String encoding,
        int totalBytes,
        List<CharacterEncoding> characters,
        Rasterization raster
) {
    public record CharacterEncoding(
            String character,
            String codePoint,
            int byteCount,
            List<ByteRepresentation> bytes
    ) {}

    public record ByteRepresentation(
            int decimal,
            String hexadecimal,
            String binary
    ) {}

    /** pixels are row-major from top-left; 1 is white and 0 is black. */
    public record Rasterization(
            int width,
            int height,
            int glyphWidth,
            int glyphHeight,
            String pixels,
            List<RasterGlyph> glyphs
    ) {}

    public record RasterGlyph(
            String character,
            String renderedAs,
            boolean fallback
    ) {}
}

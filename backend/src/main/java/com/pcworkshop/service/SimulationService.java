package com.pcworkshop.service;

import com.pcworkshop.dto.SimulationResponse;
import org.springframework.stereotype.Service;

@Service
public class SimulationService {
    private final Utf8Encoder utf8Encoder;
    private final MonospaceRasterizer monospaceRasterizer;

    public SimulationService(Utf8Encoder utf8Encoder, MonospaceRasterizer monospaceRasterizer) {
        this.utf8Encoder = utf8Encoder;
        this.monospaceRasterizer = monospaceRasterizer;
    }

    public SimulationResponse encode(String text) {
        Utf8Encoder.EncodingResult encoding = utf8Encoder.encode(text);
        SimulationResponse.Rasterization raster = monospaceRasterizer.rasterize(text);
        return new SimulationResponse(text, "UTF-8", encoding.totalBytes(), encoding.characters(), raster);
    }
}

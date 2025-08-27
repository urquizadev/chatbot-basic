import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "El mensaje es requerido." });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "Responde en el mismo idioma del mensaje del usuario. Usa exactamente el idioma del usuario sin traducir." },
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Error en la API de Groq.");
        }

        const data = await response.json();
        res.json({ reply: data.choices?.[0]?.message?.content || "No se obtuvo respuesta." });

    } catch (error) {
        console.error("Error en la solicitud a GroqCloud:", error.message);
        res.status(500).json({ error: "Error al procesar la solicitud." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
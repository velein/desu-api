"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const express_1 = __importDefault(require("express"));
const playwright_1 = __importDefault(require("playwright"));
const app = (0, express_1.default)();
const PORT = 3000;
const supabase = (0, supabase_js_1.createClient)(`https://crsemvvyoczkgaxjzkrf.supabase.co`, `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyc2VtdnZ5b2N6a2dheGp6a3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg3MDA2OTksImV4cCI6MjAyNDI3NjY5OX0.MP2vlajxUxuxkk_PUhYUWUIfD0zlzchaLxSWgFc6UBs`);
app.get("/", (req, res) => {
    res.send("Hello, TypeScript with Express!");
});
app.get("/anime", async (req, res) => {
    const { data } = await supabase.from("anime").select();
    res.json(data);
});
app.get("/anime/:animeID", async (req, res) => {
    const { data } = await supabase
        .from("anime")
        .select("*")
        .eq("id", req.params.animeID)
        .single();
    res.json(data);
});
app.get("/anime/:animeID/episode/:episodeID", async (req, res) => {
    const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("id", req.params.episodeID)
        .eq("animeID", req.params.animeID)
        .single();
    res.json(data);
});
app.post("/anime/:animeID/episode/:episode", async (req, res) => {
    const animeData = await supabase
        .from("anime")
        .select("*")
        .eq("id", req.params.animeID)
        .single();
    const episodes = JSON.parse(animeData?.data.episodes) || [];
    const episode = episodes?.find((episode) => episode.number === req.params.episode);
    const browser = await playwright_1.default.chromium.launch();
    const episodePage = await browser.newPage();
    await episodePage.goto(episode.url);
    const videoUrl = await episodePage
        .frameLocator("iframe")
        .locator("video")
        .getAttribute("src");
    await browser.close();
    const { data } = await supabase.from("episodes").insert({
        animeID: req.params.animeID,
        title: episode.title,
        videoUrl,
    });
    res.json(data);
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

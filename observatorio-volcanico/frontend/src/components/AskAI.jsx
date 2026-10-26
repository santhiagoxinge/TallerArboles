const QUESTION =
  "Explícame con un ejemplo sencillo cómo funciona un árbol binario de búsqueda: inserción, búsqueda, recorridos inorden/preorden/postorden y por qué es más rápido que una lista.";

const ASSISTANTS = [
  ["Claude", `https://claude.ai/new?q=${encodeURIComponent(QUESTION)}`],
  ["ChatGPT", `https://chatgpt.com/?q=${encodeURIComponent(QUESTION)}`],
  ["Perplexity", `https://www.perplexity.ai/search?q=${encodeURIComponent(QUESTION)}`],
];

export default function AskAI() {
  return (
    <section className="glass panel ask" aria-labelledby="ask-title">
      <h3 id="ask-title">Pregúntale a la IA sobre árboles</h3>
      <p className="sub">Abre un asistente con una pregunta ya escrita sobre árboles binarios de búsqueda (no se envían tus datos).</p>
      <div className="btn-row">
        {ASSISTANTS.map(([name, href]) => (
          <a key={name} className="btn soft" href={href} target="_blank" rel="noopener noreferrer">
            {name} ↗
          </a>
        ))}
      </div>
    </section>
  );
}

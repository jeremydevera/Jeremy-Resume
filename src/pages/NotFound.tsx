import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function NotFound() {
  return (
    <Layout>
      <article className="article">
        <div className="eyebrow">404</div>
        <h1>page not found</h1>
        <p className="tagline">this page doesn’t exist.</p>
        <Link to="/" className="btn" style={{ marginTop: 12 }}>
          ← go home
        </Link>
      </article>
    </Layout>
  );
}

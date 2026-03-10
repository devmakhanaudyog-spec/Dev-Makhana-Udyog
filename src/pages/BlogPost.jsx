
import React from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../data/makhana";
import { ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug) || blogPosts[0];

  // Images for alternating layout (with captions), exclude the hero image if present
  // Removed unused publicUrl variable
  const allExtraImages = [
    { src: "https://res.cloudinary.com/dujkkenmf/image/upload/v1769242708/products/rtrnbzqs942qpk1bndb8.jpg", caption: "Freshly roasted premium Makhana" },
    { src: "https://res.cloudinary.com/dujkkenmf/image/upload/v1769242710/products/zyc6ysqfsknimwwly9sv.jpg", caption: "4 Suta Makhana: Value and quality" },
    { src: "https://res.cloudinary.com/dujkkenmf/image/upload/v1769243116/products/kssbglict17cc4xtxthj.webp", caption: "Makhana: The clean-label superfood" },
    { src: "https://res.cloudinary.com/dujkkenmf/image/upload/v1769243127/products/wo9lzrfabc3cpvjt4x7a.jpg", caption: "5 Suta: Clean-label snack" },
    { src: "https://res.cloudinary.com/dujkkenmf/image/upload/v1769239072/products/qttb7wg7wgu8s0jfixgx.jpg", caption: "Flavoured Makhana" }
  ];
  // Filter out the hero image if it exists in extra images
  // Compare only the path part for filtering
  const extraImages = allExtraImages.filter(img => !post.image || !img.src.endsWith(post.image.replace(/^.*\/product_image\//, "/product_image/")));

  // Author/date/reading time (date from post)
  const author = "Makhaantraa Team";
  let date = "";
  let readingTime = "5 min read";
  if (post.date) {
    try {
      const d = new Date(post.date);
      date = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      date = post.date;
    }
  }

  // Split FAQ from main content
  const faqStart = post.body.findIndex(p => /^Q\d+\./.test(p));
  const mainBody = faqStart !== -1 ? post.body.slice(0, faqStart) : post.body;
  const faqBody = faqStart !== -1 ? post.body.slice(faqStart) : [];

  // Render main content: section headings full-width, two-column only for sections with images, highlight boxes for tips/notes, improved spacing
  function renderModernContent(body) {
    const rows = [];
    let imgIdx = 0;
    let altBg = false;
    for (let i = 0; i < body.length; i++) {
      let highlighted = body[i]
        .replace(/\b(GI[- ]?tag(?:ged)?|Mithila|Makhaantraafoods|clean-label|superfood|moisture|pop[- ]?rate|premium|authentic|nutritional|export|retail|tradition|quality|Bihar|India|global|certificates?|analysis|testing|packaging|crunch|flavor|vegan|gluten[- ]?free|minerals|allergens|plant[- ]?based|shelf life|traceability|consistency|hand[- ]?harvested|sun[- ]?dried|roasted|nitrogen flushing|high[- ]?barrier|food[- ]?grade|logistics|value|story|brand|partner|supply chain|modern|natural|processing|transparency|innovation|market|nutrition|health|wellness|snack|snacking|retailers?|exporters?|chefs?|foodservice|buyers?|consumers?|business|partners?|documentation|confidence|conclusion|FAQ)\b/gi, '<span class="text-brand font-semibold">$1</span>');
      // Section heading detection (simulate h2)
      if (/^(What|Why|How|Conclusion|The Magic|Taking|Packaging|A Neutral|By blending|From a trade|We strengthen|This tradition|For our partners|For retailers|For chefs|Precision Testing|Climate Control|The 'Pop' Test|Trade Support)/i.test(body[i])) {
        rows.push(
          <h2 key={"h2-"+i} className="text-2xl font-bold text-brand mt-12 mb-4 w-full">{body[i]}</h2>
        );
        altBg = !altBg;
        continue;
      }
      // Quote/callout box
      if (/^Quote:/i.test(body[i])) {
        rows.push(
          <blockquote key={"quote-"+i} className="border-l-4 border-brand bg-brand-soft px-6 py-4 my-8 italic text-lg text-brand font-semibold rounded shadow-md w-full">
            {body[i].replace(/^Quote:/i, "")}
          </blockquote>
        );
        continue;
      }
      // Highlight box
      if (/^Tip:|^Note:|^Important:|^Did you know\?/i.test(body[i])) {
        rows.push(
          <div key={"box-"+i} className="bg-brand-soft border-l-4 border-brand px-4 py-3 my-6 rounded text-brand font-semibold text-lg w-full">{body[i]}</div>
        );
        continue;
      }
      // Drop cap for first paragraph
      if (i === 0) {
        rows.push(
          <div key={i} className={`my-8 ${altBg ? 'bg-brand-soft/50 rounded-xl px-4 py-6' : ''}`}>
            <p className="text-slate-800 leading-relaxed text-lg text-justify first-letter:text-5xl first-letter:font-bold first-letter:text-brand first-letter:float-left first-letter:mr-3" dangerouslySetInnerHTML={{ __html: highlighted }} />
          </div>
        );
        continue;
      }
      // If there is an image for this section, use two-column, else full-width text
      if (imgIdx < extraImages.length && i % 2 === 0) {
        rows.push(
          <div key={i} className={`grid md:grid-cols-2 gap-8 items-center my-12 ${altBg ? 'bg-brand-soft/50 rounded-xl px-4 py-8' : ''}`}>
            <div>
              <p className="text-slate-800 leading-relaxed text-lg text-justify" dangerouslySetInnerHTML={{ __html: highlighted }} />
            </div>
            <div>
                <img
                  src={extraImages[imgIdx].src}
                  alt="Makhana visual"
                  className="w-full rounded-xl shadow-lg object-cover max-h-80 mb-2"
                />
              <div className="text-xs text-slate-500 text-center mt-1">{extraImages[imgIdx].caption}</div>
            </div>
          </div>
        );
        imgIdx++;
      } else {
        rows.push(
          <div key={i} className={`my-8 ${altBg ? 'bg-brand-soft/50 rounded-xl px-4 py-6' : ''}`}>
            <p className="text-slate-800 leading-relaxed text-lg text-justify" dangerouslySetInnerHTML={{ __html: highlighted }} />
          </div>
        );
      }
      altBg = !altBg;
    }
    return rows;
  }

  // Render FAQ section
  function renderFAQ(faqBody) {
    if (!faqBody.length) return null;
    const faqs = [];
    for (let i = 0; i < faqBody.length; i += 2) {
      const q = faqBody[i] || "";
      const a = faqBody[i + 1] || "";
      faqs.push(
        <div key={i} className="mb-6 p-6 bg-brand-soft rounded-xl border-l-4 border-brand">
          <div className="font-bold text-brand text-lg mb-2" dangerouslySetInnerHTML={{ __html: q.replace(/^(Q\d+\..*)$/, '<span>$1</span>') }} />
          <div className="italic text-slate-700 text-base pl-2" dangerouslySetInnerHTML={{ __html: a.replace(/^(A\d+\..*)$/, '<span>$1</span>') }} />
        </div>
      );
    }
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-brand mb-6">Frequently Asked Questions</h2>
        {faqs}
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-soft min-h-screen pb-10">
      {/* Hero image */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full max-h-96 object-cover rounded-b-3xl shadow-lg -mb-16"
        />
      )}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg px-8 py-12 mt-0 mb-10 relative z-10">
        <Link to="/blog" className="text-brand inline-flex items-center gap-2 text-sm font-semibold mb-2"><ArrowLeft size={16} /> Back to blog</Link>
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <p className="text-lg text-brand mb-2">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-8">
          <span>By {author}</span>
          <span>• {date}</span>
          <span>• {readingTime}</span>
        </div>
        {/* Social share button with Web Share API and fallback */}
        <div className="flex gap-3 mb-8">
          <button
            className="bg-brand-soft hover:bg-brand text-brand font-bold px-3 py-2 rounded transition"
            onClick={() => {
              const shareData = {
                title: post.title,
                text: post.excerpt,
                url: window.location.href,
              };
              if (navigator.share) {
                navigator.share(shareData).catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).then(() => {
                  alert('Link copied to clipboard!');
                });
              } else {
                window.prompt('Copy this link:', window.location.href);
              }
            }}
          >
            Share
          </button>
        </div>
        {/* Modern content layout */}
        <div className="w-full">
          {renderModernContent(mainBody)}
        </div>
        {/* FAQ Section */}
        {renderFAQ(faqBody)}
      </div>
    </div>
  );
}

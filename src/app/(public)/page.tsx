import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Heart, LayoutGrid, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/commerce/section-header";
import { ProductCard } from "@/components/commerce/product-card";
import { BlogCard } from "@/components/commerce/blog-card";
import { ProjectCard } from "@/components/commerce/project-card";
import { EventCard } from "@/components/commerce/event-card";
import { PhotoPlaceholder } from "@/components/commerce/photo-placeholder";
import { stats, programs, products, blogs, projects, events } from "@/lib/data";

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  Leaf: <Leaf size={22} />,
  Heart: <Heart size={22} />,
  LayoutGrid: <LayoutGrid size={22} />,
  Package: <Package size={22} />,
};

// Hero mosaic: 4 real community photos
const HERO_MOSAIC = [
  { src: "/images/hero/community5.jpg", label: "Harvest" },
  { src: "/images/hero/community6.jpg", label: "Textile" },
  { src: "/images/hero/community7.jpg", label: "Community" },
  { src: "/images/hero/community4.jpg", label: "Market" },
];

export default function HomePage() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-[#F7FAF8] to-white dark:from-[#112618] dark:to-[#0f1611] border-b border-ink-200 dark:border-[#263a2b]">
        <div className="max-w-[var(--container-max)] mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-[1.05fr_1fr] gap-14 items-center">
            <div>
              <Badge tone="brand" leadingIcon={<Leaf size={13} />} className="mb-5">
                Rooted in the Igbo Dibia tradition
              </Badge>
              <h1 className="font-display font-bold text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.04] tracking-tight text-ink dark:text-[#dceee3]">
                Reviving Indigenous Traditions for Collective Economic Growth
              </h1>
              <p className="mt-5 text-lg text-ink-600 dark:text-[#89a895] leading-relaxed max-w-[520px] font-sans">
                A living symbol of tradition, heritage and collective identity — empowering communities through commerce, culture, and solidarity.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/shop">
                  <Button variant="primary" size="lg" trailingIcon={<ArrowRight size={18} />}>
                    Explore the Marketplace
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="secondary" size="lg">Learn Our Story</Button>
                </Link>
              </div>
            </div>

            {/* Hero image grid — 2×2 equal boxes */}
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-3 h-[420px]">
              {HERO_MOSAIC.map((img) => (
                <div key={img.label} className="relative rounded-xl overflow-hidden">
                  <Image src={img.src} alt={img.label} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-white dark:bg-[#0f1611] border-b border-ink-200 dark:border-[#263a2b]">
        <div className="max-w-[var(--container-max)] mx-auto px-6 py-9 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-4xl text-brand leading-none">{s.value}</div>
              <div className="mt-1.5 text-sm text-ink-500 dark:text-[#668074] font-sans">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0f1611]">
        <div className="max-w-[var(--container-max)] mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeader
              overline="Our Story"
              title="A marketplace rooted in heritage"
              subtext="Symbodied takes its name and spirit from the Dibia tradition — keepers of knowledge, medicine, and community. We bring that ethos to commerce."
            />
            <blockquote className="mt-7 pl-5 border-l-[3px] border-brand font-display font-semibold text-xl text-ink dark:text-[#dceee3] leading-relaxed">
              "When tradition and trade move together, whole communities rise."
            </blockquote>
            <div className="mt-6">
              <Link href="/about">
                <Button variant="ghost" trailingIcon={<ArrowRight size={18} />}>Read our mission</Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[420px] rounded-xl overflow-hidden">
            <Image
              src="/images/static/newMission.jpg"
              alt="Community gathering"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="py-20 md:py-28 bg-ink-100 dark:bg-[#112618]">
        <div className="max-w-[var(--container-max)] mx-auto px-6">
          <SectionHeader
            align="center"
            overline="What we do"
            title="Our Programs & Initiatives"
            subtext="Four pillars channel commerce back into cultural and economic empowerment."
            className="mb-10"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {programs.map((p) => (
              <Card key={p.name} hoverable padding="lg" style={{ borderLeft: "3px solid var(--brand-primary)" }}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light dark:bg-[#1b2d20] text-brand dark:text-[#2E9B5A]">
                  {PROGRAM_ICONS[p.icon]}
                </span>
                <h3 className="mt-4 mb-2 font-sans font-bold text-lg text-ink dark:text-[#dceee3]">{p.name}</h3>
                <p className="text-sm text-ink-600 dark:text-[#89a895] font-sans leading-relaxed">{p.desc}</p>
                <Link
                  href={`/programs/${p.slug}`}
                  className="mt-3.5 inline-flex items-center gap-1 text-sm font-semibold text-brand dark:text-[#2E9B5A] hover:text-brand-hover transition-colors font-sans"
                >
                  Explore <ArrowRight size={14} />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0f1611]">
        <div className="max-w-[var(--container-max)] mx-auto px-6">
          <SectionHeader
            overline="From Our Marketplace"
            title="Featured Products"
            action={
              <Link href="/shop">
                <Button variant="ghost" size="sm" trailingIcon={<ArrowRight size={15} />}>View all</Button>
              </Link>
            }
            className="mb-8"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="py-20 md:py-28 bg-brand-light dark:bg-[#112618]">
        <div className="max-w-[var(--container-max)] mx-auto px-6">
          <SectionHeader
            overline="Articles & Insights"
            title="From the Community"
            action={
              <Link href="/blog">
                <Button variant="ghost" size="sm" trailingIcon={<ArrowRight size={15} />}>Read all</Button>
              </Link>
            }
            className="mb-8"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.map((b) => (
              <BlogCard key={b.id} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS (dark strip) ── */}
      <section className="py-20 md:py-28 bg-ink dark:bg-[#1b2d20]">
        <div className="max-w-[var(--container-max)] mx-auto px-6">
          <SectionHeader
            overline="Crowdfunding"
            title="Support Community Projects"
            subtext="Back initiatives that turn tradition into livelihoods."
            className="mb-8 [&_h2]:text-white [&_span]:text-gold-mid [&_p]:text-white/70"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} {...p} dark />
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0f1611]">
        <div className="max-w-[var(--container-max)] mx-auto px-6">
          <SectionHeader
            overline="What's on"
            title="Upcoming Events"
            action={
              <Link href="/events">
                <Button variant="ghost" size="sm" trailingIcon={<ArrowRight size={15} />}>See calendar</Button>
              </Link>
            }
            className="mb-8"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e) => (
              <EventCard key={e.id} {...e} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLIDARITY ── */}
      <section className="grid md:grid-cols-2">
        <div className="bg-brand flex items-center">
          <div className="px-14 py-20 max-w-[520px] mx-auto md:mr-0">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-gold-mid font-sans">
              International Solidarity
            </span>
            <h2 className="mt-3 mb-4 font-display font-bold text-[2.25rem] leading-[1.1] text-white">
              We believe in the power of collaboration
            </h2>
            <p className="text-white/85 font-sans text-lg leading-relaxed">
              Supporters across the diaspora and beyond fund, mentor, and amplify the communities we serve.
            </p>
            <div className="mt-7">
              <Link href="/projects">
                <Button variant="gold" size="lg">Join the Movement</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative min-h-[420px] bg-white dark:bg-[#162018]">
          <Image
            src="/images/static/international_security.png"
            alt="International solidarity"
            fill
            className="object-contain"
            sizes="50vw"
          />
        </div>
      </section>
    </div>
  );
}

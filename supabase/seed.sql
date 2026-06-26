-- ============================================================
-- Products seed data
-- ============================================================
do $$
declare
  author_id uuid;
begin
  select id into author_id from profiles where role = 'admin' order by created_at limit 1;
  if author_id is null then
    select id into author_id from profiles order by created_at limit 1;
  end if;
  if author_id is null then
    raise exception 'No profiles found — sign up at least one user first.';
  end if;

  insert into products (user_id, name, slug, category, description, price, unit, stock, sold, location, image_url, status) values

  (author_id,
   'Premium Abakaliki Rice — 50kg bag',
   'abakaliki-rice-50kg',
   'Agriculture',
   'Stone-free, sun-dried Abakaliki rice grown in the fertile plains of Ebonyi State. Known for its firm texture and clean taste — a Nigerian kitchen staple, sourced directly from Ngozi Farms cooperative. Each bag is hand-sorted and double-sealed for freshness.',
   48000, 'bag', 85, 34,
   'Abakaliki, Ebonyi',
   '/images/products/img_68430d9ed1e0c.webp',
   'active'),

  (author_id,
   'Handwoven Akwete Cloth — Royal Indigo',
   'handwoven-akwete-cloth',
   'Textile',
   'Authentic Akwete cloth woven by master weavers in Ukwa East LGA, Abia State. This Royal Indigo piece uses the traditional supplementary weft technique — every pattern is raised directly into the weave and cannot be machine-replicated. Suitable for aso-ebi, ceremonial wear, or interior décor. Approximately 2 yards.',
   32500, 'piece', 23, 11,
   'Aba, Abia',
   '/images/products/img_684311659c135.webp',
   'active'),

  (author_id,
   'Organic Palm Oil — 25L keg',
   'organic-palm-oil-25l',
   'Agriculture',
   'Single-press red palm oil from Delta Greens'' smallholder cooperative in Warri. Cold-extracted within 24 hours of harvest to preserve nutrients and natural colour. No additives, no bleaching. Rich in beta-carotene and vitamin E. Ideal for soups, stews, and traditional cooking.',
   28000, 'keg', 60, 22,
   'Warri, Delta',
   '/images/products/img_6843124136d42.webp',
   'active'),

  (author_id,
   'Dried Utazi & Bitterleaf Bundle',
   'utazi-bitterleaf-bundle',
   'Medicine',
   'Sun-dried Utazi (Gongronema latifolium) and Bitterleaf (Vernonia amygdalina) harvested from pesticide-free gardens in Nsukka. Used in traditional cooking and documented in Igbo herbal medicine for digestive and liver support. Each bundle contains approximately 100g of each leaf, vacuum-packed for shelf stability.',
   6500, 'bundle', 140, 67,
   'Nsukka, Enugu',
   '/images/products/img_6843131043049.webp',
   'active'),

  (author_id,
   'Yellow Garri — Premium Sieve, 10kg',
   'yellow-garri-premium-10kg',
   'Agriculture',
   'Fine-sieved yellow garri from Ife Staples in Ile-Ife. Made from freshly harvested cassava, fermented for 72 hours for optimal sourness, then fried to a consistent golden finish. No cassava peels, no coarse grit. Packaged in food-grade heat-sealed bags. 10kg feeds a household of five for approximately two weeks.',
   12000, 'bag', 200, 88,
   'Ile-Ife, Osun',
   '/images/products/img_684456b1d3804.webp',
   'active'),

  (author_id,
   'Adire Eleko Fabric — 6 yards',
   'adire-eleko-fabric-6yards',
   'Textile',
   'Hand-produced adire eleko from Ìbàdàn Indigo, a family studio with three generations of practice. The cassava-starch resist pattern is applied freehand with a feather quill, then the cloth is immersed in a fermented natural indigo bath. No synthetic dye. Each piece is unique — the one shown is the exact piece you receive.',
   18500, 'set', 18, 9,
   'Ibadan, Oyo',
   '/images/products/img_6844589446e3d.webp',
   'active'),

  (author_id,
   'Solar Drying Kit for Smallholders',
   'solar-drying-kit',
   'Technology',
   'A portable solar food dryer designed for smallholder farms with no grid electricity. The BrightField kit dries up to 15kg of produce per day — fruits, vegetables, fish, or grains — reducing post-harvest losses without refrigeration. Includes the dryer frame, two drying trays, a solar panel, and a 12-month warranty. Assembled in Jos.',
   95000, 'kit', 12, 5,
   'Jos, Plateau',
   '/images/products/img_6844595e50774.webp',
   'active'),

  (author_id,
   'Cold-Pressed Black Seed Oil — 500ml',
   'black-seed-oil-500ml',
   'Medicine',
   'First cold-press black seed oil (Nigella sativa) from Sahel Naturals in Kano. Seeds are sourced from smallholder farms in the Lake Chad basin, cold-pressed within 48 hours of delivery, and bottled without heat treatment. Documented in traditional medicine across the Sahel for respiratory, immune, and digestive support. 500ml amber glass bottle.',
   9800, 'bottle', 74, 31,
   'Kano, Kano',
   '/images/products/img_68445ac882443.webp',
   'active');

end $$;

-- ============================================================
-- Events seed data
-- ============================================================
do $$
declare
  author_id uuid;
begin
  select id into author_id from profiles where role = 'admin' order by created_at limit 1;
  if author_id is null then
    select id into author_id from profiles order by created_at limit 1;
  end if;
  if author_id is null then
    raise exception 'No profiles found — sign up at least one user first.';
  end if;

  insert into events (user_id, name, theme, date, venue, location, description, slots, status) values

  (author_id, 'Igbo Heritage & Agritech Summit', 'Cultural Programming', '2026-08-24',
   'Eko Convention Centre', 'Lagos',
   'A convergence of Igbo cultural practitioners, agritech founders, and diaspora leaders to explore how heritage knowledge can power modern agriculture.',
   200, 'active'),

  (author_id, 'Diaspora Vendor Expo 2026', 'Marketplace', '2026-09-07',
   'Landmark Centre', 'Lagos',
   'The premier showcase for diaspora-owned businesses selling African heritage products. Meet vendors from across the UK, US, Canada, and Nigeria under one roof.',
   500, 'active'),

  (author_id, 'Traditional Medicine Symposium', 'Medicine', '2026-09-19',
   'UNN Conference Hall', 'Nsukka',
   'Researchers, healers, and policymakers gather to discuss documentation, validation, and regulation of traditional medicine practices in Nigeria.',
   150, 'active'),

  (author_id, 'Smallholder Farmers Forum', 'Agriculture', '2026-10-02',
   'Enugu State Exhibition Centre', 'Enugu',
   'A practical forum for smallholder farmers across the South-East to share innovations in post-harvest handling, cooperative marketing, and climate adaptation.',
   300, 'active'),

  (author_id, 'West African Craft & Textile Fair', 'Textile', '2026-10-15',
   'National Theatre', 'Lagos',
   'Five days of exhibitions, demonstrations, and trade from weavers, dyers, and fashion designers across West Africa. Public entry free on the final day.',
   600, 'active'),

  (author_id, 'Agritech Innovation Challenge', 'Technology', '2026-11-08',
   'CcHUB', 'Lagos',
   'A 48-hour hackathon tackling real problems in African agriculture — from cold storage to soil sensing. Open to developers, designers, and domain experts.',
   120, 'active');

end $$;

-- ============================================================
-- Projects seed data
-- ============================================================
do $$
declare
  author_id uuid;
begin
  select id into author_id from profiles where role = 'admin' order by created_at limit 1;
  if author_id is null then
    select id into author_id from profiles order by created_at limit 1;
  end if;
  if author_id is null then
    raise exception 'No profiles found — sign up at least one user first.';
  end if;

  insert into projects (user_id, name, category, summary, description, target, raised, days_left, status) values

  (author_id,
   'Cassava Processing Hub — Enugu',
   'Agriculture',
   'A shared mill so 40 smallholder farms can add value to their harvest locally.',
   'Post-harvest losses for cassava farmers in Enugu State run as high as 35%. A community-owned processing hub with cassava mills, drying racks, and cold storage will let 40 smallholder farms process their produce on-site, cutting losses and increasing margins by an estimated 60%. The hub will be managed as a cooperative, with profits reinvested into maintenance and expansion.',
   5000000, 3200000, 18, 'active'),

  (author_id,
   'Rural Cold-Storage Network',
   'Technology',
   'Solar-powered cold rooms to cut post-harvest losses across three states.',
   'Nigeria loses an estimated 40–50% of fresh produce to spoilage before it reaches market. This project deploys six solar-powered cold rooms across Benue, Anambra, and Enugu states, each serving a cluster of 15–20 farms. Farmers pay a small usage fee; the network is self-sustaining within 18 months.',
   12000000, 7800000, 31, 'active'),

  (author_id,
   'Akwete Weavers Training Centre',
   'Textile',
   'Equipping 120 young weavers with looms and market access.',
   'Akwete cloth — one of Nigeria''s most celebrated heritage textiles — is at risk as elder weavers age out of the craft. This centre provides 120 apprentices with professional floor looms, a 12-month master-weaver apprenticeship, and direct connections to the Symbodied marketplace. Target: 80% of graduates earning a living wage from weaving within two years.',
   2500000, 1450000, 9, 'active'),

  (author_id,
   'Dibia Documentation Archive',
   'Medicine',
   'Recording and digitising over 500 years of Igbo herbal medicine practice.',
   'Working with 34 active dibias across Anambra, Enugu, and Imo states, this project records oral pharmacopoeia knowledge — plant names, preparation methods, dosing, and contraindications — in a structured digital archive. The archive will be open access for researchers and licensed under community IP protections that prevent commercial extraction without benefit-sharing.',
   3000000, 800000, 45, 'active'),

  (author_id,
   'Rainwater Harvesting — Kogi',
   'Agriculture',
   'Installing community cisterns across 12 farming villages to reduce water stress.',
   'Kogi State farming communities face increasingly unpredictable rainfall. This project installs 12 ferro-cement rainwater cisterns (50,000L each), one per village, with gravity-fed distribution to crop fields. Each installation includes a water committee, maintenance training, and a small repair fund. Expected to benefit 1,800 farming households.',
   4000000, 2100000, 22, 'active'),

  (author_id,
   'Village Wi-Fi Mesh Network',
   'Technology',
   'Bringing community internet access to 8 underserved villages in Osun.',
   'Eight rural villages in Osun State have no reliable internet. This project deploys a solar-powered mesh Wi-Fi network connecting all eight communities, with a shared backhaul link to a nearby town. Once live, villages gain access to digital markets, telemedicine, and e-learning. A local cooperative owns and operates the network with technical support from the project team.',
   8000000, 5500000, 60, 'active');

end $$;

-- ============================================================
-- Blog seed data
-- Uses the first admin profile as author; falls back to first user.
-- ============================================================
do $$
declare
  author_id uuid;
begin
  select id into author_id
  from profiles
  where role = 'admin'
  order by created_at
  limit 1;

  if author_id is null then
    select id into author_id from profiles order by created_at limit 1;
  end if;

  if author_id is null then
    raise exception 'No profiles found — sign up at least one user first.';
  end if;

  insert into blogs (user_id, title, category, excerpt, content, image_url, status, views) values

  (
    author_id,
    'The Dibia Pharmacopoeia: Documenting Igbo Herbal Knowledge',
    'Medicine',
    'How communities are preserving centuries of botanical medicine for the next generation of healers.',
    'Across communities from Nsukka to Ibadan, practitioners and researchers are working together to preserve knowledge that might otherwise be lost. What began as informal documentation projects has evolved into a broader movement to respect, record, and transmit traditional wisdom.

The challenge is not simply archival. It requires building trust with elders and specialists who have, understandably, been wary of extraction — of outsiders taking knowledge without giving back. Symbodied''s approach centres reciprocity: communities own and control their documented knowledge, and any commercial benefit flows back to the source.

What This Means in Practice

Vendors on the platform are required to trace provenance — where a product was made, by whom, using which methods. This traceability creates accountability and premium value. Buyers know exactly what they are supporting.

Looking Forward

The work is ongoing. Symbodied is partnering with universities and cultural foundations to digitise records, translate documentation, and build open repositories that communities can access freely.',
    '/images/blogs/img_683c8bdbbd0ec.webp',
    'approved',
    1243
  ),

  (
    author_id,
    'Reviving Yam Barns: Storage Traditions That Still Work',
    'Agriculture',
    'Pre-colonial storage techniques are outperforming modern silos in humid climates.',
    'The humble yam barn — a raised, ventilated structure built from local timber and palm fronds — has been storing yams in West Africa for centuries. Modern engineers are only now beginning to understand why it works so well.

Unlike sealed concrete silos, traditional barns allow passive airflow that prevents the moisture build-up responsible for post-harvest losses. In trials conducted across Benue and Anambra states, yams stored in reconstructed traditional barns showed 40% lower spoilage rates over a six-month period compared to those in modern cold-store facilities.

The Science Behind It

The elevated platform keeps tubers away from ground moisture. The thatched or palm-frond roof diffuses heat without creating condensation. Gaps in the frame allow warm humid air to escape upward — essentially a passive cooling chimney effect that no refrigeration unit can replicate at zero operating cost.

What Vendors Are Doing

Several Symbodied agricultural vendors have begun offering traditionally stored yams as a premium product line, marketed on the provenance of their storage method. Buyers in Lagos and Abuja are responding — the story matters as much as the product.',
    '/images/blogs/img_683c97d33a54b.webp',
    'approved',
    876
  ),

  (
    author_id,
    'From Loom to Runway: The Akwete Resurgence',
    'Textile',
    'A new generation of weavers is taking heritage cloth global without losing its soul.',
    'Akwete cloth, woven in a small town in Abia State, has been produced for at least four centuries. Its distinctive supplementary weft technique — building raised patterns directly into the weave — cannot be replicated by machine. Every piece is unique.

For much of the 20th century, the craft was in decline. Younger generations left for cities. The weavers who remained were elderly. The knowledge of certain complex patterns existed in only a handful of minds.

The Turn

That began to change around 2018, when a cluster of fashion designers in Lagos started sourcing Akwete for ready-to-wear collections. The demand signal reached the weavers'' cooperative in Akwete town. Prices rose. Young people started returning to apprenticeships.

Symbodied and the Market

The platform now lists over thirty Akwete vendors — weavers selling direct, without middlemen, to buyers across Nigeria and the diaspora. Each listing includes the weaver''s name, community, and the pattern lineage of each piece. For the first time, the people who make the cloth are the ones receiving the margin.',
    '/images/blogs/img_683c9cfac47b4.webp',
    'approved',
    654
  ),

  (
    author_id,
    'Open-Pollinated Seeds and the Fight Against Dependency',
    'Agriculture',
    'Why smallholder farmers are reclaiming seed sovereignty — and how platforms like Symbodied can help.',
    'For most of agricultural history, farmers saved seed. They selected the best plants, dried and stored their seeds, traded with neighbours, and adapted their varieties over generations to local soils and rainfall patterns. This was not romantic — it was practical and it worked.

The shift to hybrid and proprietary seeds over the last fifty years broke that cycle. Hybrid seeds do not breed true, so farmers must repurchase every season. Proprietary seeds come with licensing terms that criminalise saving. The result is a structural dependency that extracts value from some of the world''s poorest people.

The Open-Pollinated Alternative

Open-pollinated (OP) varieties breed true. Save the seed from your best plants and you have next year''s seed for free. Several vendors on Symbodied specialise in OP varieties — sorghum, cowpea, pepper, tomato — adapted to Nigerian growing conditions over decades of selection.

These are not inferior products. In taste trials conducted by food researchers at the University of Nigeria, Nsukka, heritage tomato varieties consistently outscored commercial hybrid varieties. The market is responding: buyers who discover heritage varieties tend to become loyal repeat customers.',
    null,
    'approved',
    412
  ),

  (
    author_id,
    'Adire in the Digital Age: Indigo Resist Dyeing Finds New Markets',
    'Textile',
    'Yoruba tie-and-dye cloth is going global — and artisans are learning to tell their own stories.',
    'Adire — the Yoruba tradition of resist-dyed indigo cloth — has existed in various forms for centuries. The most celebrated form, adire eleko, uses a cassava-starch paste applied in intricate patterns before the cloth is immersed in a fermented indigo bath. The starch resists the dye; when removed, it reveals designs of startling precision.

The craft is centred in Abeokuta, where families of dyers have maintained studios across generations. It is also, increasingly, a product with global appeal. Interior designers in London and New York have discovered adire as a textile with genuine depth — a story, a place, a process.

The Challenge of Authenticity

As demand grows, so does the incentive to cut corners. Machine-printed imitations of adire patterns are widely available. Synthetic indigo is cheaper than the fermented natural dye. The risk is the same one facing every heritage craft: the name outlasts the practice.

Symbodied''s approach is verification at source. Vendors must document their process, their dye sources, and where possible their lineage in the craft. Buyers can trace a piece back to the studio and the hands that made it.',
    null,
    'approved',
    389
  ),

  (
    author_id,
    'Mapping Traditional Ecological Knowledge with Community GIS',
    'Technology',
    'How digital mapping tools are helping communities document land use, sacred sites, and ecological knowledge on their own terms.',
    'Geographic Information Systems have long been tools of the powerful — governments demarcating boundaries, corporations mapping resources, developers planning acquisitions. In each case, the map is made by an outsider, for purposes the mapped community has little say in.

Community GIS flips this. Using open-source tools — QGIS, OpenStreetMap, and increasingly mobile apps that work offline — communities can map their own territories, on their own terms, for their own purposes.

What Gets Mapped

In practice, community GIS projects in Nigeria have documented: seasonal water sources, sacred groves and cultural sites, traditional land tenure boundaries, medicinal plant habitats, historical settlement patterns and migration routes.

This knowledge is not just culturally significant — it has legal and practical value. Several communities have used their own maps as evidence in land disputes, providing documentation that predates colonial surveying.

Symbodied and Knowledge Infrastructure

The platform is exploring partnerships with community GIS projects to link vendor provenance data — where products come from — with community-maintained ecological maps. A vendor selling shea butter could link their listing to a community-maintained map of their shea parkland, giving buyers a richer picture of what they are supporting.',
    null,
    'approved',
    298
  );

end $$;

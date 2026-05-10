export const serviceCategories = [
  {
    label: "Home Cleaning",
    description: "Deep cleaning, kitchen care, sofa shampoo, and move-in help.",
    accent: "bg-teal-50 text-teal-700 border-teal-100",
    image:
      "https://maidcorner.com/wp-content/uploads/2024/10/House-cleaning-checklists-1024x512.jpg",
  },
  {
    label: "Repairs",
    description: "Electricians, plumbers, fixtures, and quick home fixes.",
    accent: "bg-amber-50 text-amber-700 border-amber-200",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj_M7VJQG5FvcUP-GK-dz0My0QKpV2WbdN4A&s",
  },
  {
    label: "Plumbing",
    description: "Leaks, blocked drains, fittings, and water-flow repairs.",
    accent: "bg-sky-50 text-sky-700 border-sky-100",
    image:
      "https://maxmigold.com/wp-content/uploads/2020/01/plumbing-1024x683-1.jpg",
  },
  {
    label: "Electrical",
    description: "Switches, sockets, lighting, wiring, and appliance checks.",
    accent: "bg-yellow-50/10 text-yellow-700 border-yellow-200",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=80",
  },
  {
    label: "Beauty & Wellness",
    description: "Salon, grooming, massage, and at-home wellness services.",
    accent: "bg-rose-50 text-rose-700 border-rose-100",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80",
  },
  {
    label: "Gardening",
    description: "Lawn care, pruning, plant care, and garden cleanup.",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=700&q=80",
  },
  {
    label: "Travel Support",
    description:
      "Airport pickup, local assistance, errands, and trip services.",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-100",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=80",
  },
  {
    label: "Hotels",
    description: "Business hotels, family stays, and budget rooms.",
    accent: "bg-violet-50 text-violet-700 border-violet-100",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80",
  },
  {
    label: "Others",
    description: "Use this when your service does not fit another category.",
    accent: "bg-slate-50 text-slate-700 border-slate-200",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
  },
];

export const serviceCategoryLabels = serviceCategories.map(
  (category) => category.label,
);

export const serviceCategoryFilterOptions = [
  "All",
  ...serviceCategoryLabels.filter((label) => label !== "Hotels"),
];

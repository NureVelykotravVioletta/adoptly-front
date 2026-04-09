export const HeroImage = () => {
  return (
    <section className="mx-auto w-full px-6">
      <div className="overflow-hidden rounded-[60px]">
        <img
          src="/hero-cat.jpg"
          alt="Cat and human"
          className="h-[500px] w-full object-cover"
        />
      </div>
    </section>
  );
};

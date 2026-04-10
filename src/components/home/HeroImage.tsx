export const HeroImage = () => {
  return (
      <section className="mx-auto w-full px-6 mb-6">
          <div className="overflow-hidden rounded-[30px] h-[calc(100vh-450px)] md:rounded-[60px] md:h-[calc(100vh-420px)] lg:h-[calc(100vh-450px)]">
        <img
          src="/hero-cat.jpg"
          alt="Cat and human"
          className="h-full max-h-full w-full object-cover"
        />
      </div>
    </section>
  );
};

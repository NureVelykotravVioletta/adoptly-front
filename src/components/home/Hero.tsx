export const Hero = () => {
  return (
    <section className="w-full shrink-0 px-6">
      <div className="w-full rounded-b-[30px] pb-8 px-5 pt-15 text-white rounded-t-none bg-[#8456F0] md:rounded-b-[60px] lg:px-16 lg:pt-28 md:pt-10 md:px-8">
        <div className="flex flex-col gap-4 lg:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="text-4xl font-bold sm:leading-11.75 md:text-[60px] md:leading-16.75 lg:text-[80px] lg:leading-21.75">
            Даруйте <span className="text-white/70">турботу</span>
            <br />
            вашим улюбленцям
          </h1>
          <div className="max-w-69.5 text-white text-[14px] lg:text-[18px] lg:leading-5.5 lg:ml-0 md:ml-auto md:text-[16px] md:leading-5">
            Обираючи улюбленця для свого дому, ви наповнюєте життя безмежною
            радістю та теплом.
          </div>
        </div>
      </div>
    </section>
  );
};

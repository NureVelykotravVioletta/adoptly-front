export const Hero = () => {
  return (
    <section className="w-full shrink-0 px-6">
      <div className="w-full rounded-b-[30px] pb-8 px-5 pt-15 text-white rounded-t-none bg-[#8456F0] md:rounded-b-[60px] lg:px-16 lg:pt-[112px] md:pt-10 md:px-8">
        <div className="flex flex-col gap-4 lg:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="text-4xl font-bold sm:leading-[47px] md:text-[60px] md:leading-[67px] lg:text-[80px] lg:leading-[87px]">
            Даруйте <span className="text-white/70">турботу</span>
            <br />
            вашим улюбленцям
          </h1>
          <div className="max-w-[278px] text-white text-[14px] lg:text-[18px] lg:leading-[22px] lg:ml-0 md:ml-auto md:text-[16px] md:leading-[20px]">
            Обираючи улюбленця для свого дому, ви наповнюєте життя безмежною
            радістю та теплом.
          </div>
        </div>
      </div>
    </section>
  );
};

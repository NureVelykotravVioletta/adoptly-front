export const Hero = () => {
  return (
    <section className="w-full shrink-0 px-6">
      <div className="w-full rounded-b-[60px] rounded-t-none bg-[#8456F0] px-[64px] pt-[112px] pb-8 text-white">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="text-[80px] leading-[87px] font-bold">
              Даруйте <span className="text-white/70">турботу</span>
              <br />
              вашим улюбленцям
            </h1>
          <div className="max-w-[278px] text-[18px] leading-[22px] text-white">
            Обираючи улюбленця для свого дому, ви наповнюєте життя безмежною
            радістю та теплом.
          </div>
        </div>
      </div>
    </section>
  );
};

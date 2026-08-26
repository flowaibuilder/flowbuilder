export default function Pricing({ content }) {
  const plans = content.plans || [];

  return (
    <div className="bg-primary py-24 sm:py-32 border-b-4 border-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000] rotate-[-1deg]">
          <h2 className="text-base font-black uppercase leading-7 text-black bg-secondary border-2 border-black inline-block px-3 py-1 mb-4 shadow-[2px_2px_0_0_#000]">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-black tracking-tight text-black sm:text-5xl uppercase">
            {content.title || 'Pricing plans for teams of all sizes'}
          </p>
          <p className="mt-6 text-lg font-bold leading-8 text-black border-t-2 border-dashed border-black pt-4">
            {content.description || 'Choose an affordable plan that\'s packed with the best features for engaging your audience.'}
          </p>
        </div>
        
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0 items-center">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-none p-8 border-4 border-black ${plan.popular ? 'bg-secondary shadow-[12px_12px_0_0_#000] lg:scale-110 z-10' : 'bg-white shadow-[8px_8px_0_0_#000]'} xl:p-10 transition-transform`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-2xl font-black uppercase text-black">
                  {plan.name}
                </h3>
                {plan.popular && (
                  <p className="rounded-none border-2 border-black bg-white px-2.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0_0_#000] rotate-[3deg]">
                    Most popular
                  </p>
                )}
              </div>
              <p className="mt-4 text-sm font-bold leading-6 text-black border-2 border-black bg-bg-base p-3 shadow-[2px_2px_0_0_#000]">
                {plan.description}
              </p>
              <p className="mt-8 flex items-baseline gap-x-1">
                <span className="text-5xl font-black tracking-tight text-black">{plan.price}</span>
                <span className="text-sm font-bold leading-6 text-black">/month</span>
              </p>
              <a
                href="#"
                className={`mt-8 block rounded-none border-4 border-black px-3 py-4 text-center text-lg font-black uppercase transition-all shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] ${
                  plan.popular
                    ? 'bg-primary text-black'
                    : 'bg-accent text-white'
                }`}
              >
                {plan.ctaText || 'Buy plan'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

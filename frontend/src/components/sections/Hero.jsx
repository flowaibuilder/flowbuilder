export default function Hero({ content }) {
  return (
    <div className="bg-secondary px-6 py-24 sm:py-32 lg:px-8 border-b-4 border-black">
      <div className="mx-auto max-w-2xl text-center flex flex-col items-center">
        <h2 className="text-4xl font-black tracking-tight text-black sm:text-6xl uppercase border-4 border-black bg-white inline-block px-6 py-4 shadow-[8px_8px_0_0_#000] mb-8 rotate-[-1deg]">
          {content.headline || 'Your Headline Here'}
        </h2>
        <p className="mt-6 text-lg font-bold leading-8 text-black bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_#000] max-w-xl rotate-[1deg]">
          {content.subheadline || 'Your subheadline text goes here. Make it catchy.'}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="#"
            className="rounded-none bg-primary px-8 py-3 text-xl font-black text-black border-4 border-black shadow-[6px_6px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] transition-all uppercase"
          >
            {content.ctaText || 'Get started'}
          </a>
        </div>
      </div>
    </div>
  );
}

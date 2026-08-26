import { Star } from 'lucide-react';

export default function Features({ content }) {
  const features = content.items || [];

  return (
    <div className="bg-bg-base py-24 sm:py-32 border-b-4 border-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000] mb-16 rotate-[1deg]">
          <h2 className="text-base font-black uppercase leading-7 text-black bg-primary border-2 border-black inline-block px-3 py-1 mb-4 shadow-[2px_2px_0_0_#000]">
            {content.tagline || 'Features'}
          </h2>
          <p className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl uppercase">
            {content.title || 'Everything you need to succeed'}
          </p>
          <p className="mt-6 text-lg font-bold leading-8 text-gray-800 border-t-2 border-dashed border-black pt-4">
            {content.description || 'Our platform provides the best tools in the industry.'}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col bg-accent border-4 border-black p-6 shadow-[6px_6px_0_0_#000] hover:-translate-y-2 transition-transform">
                <dt className="flex items-center gap-x-3 text-xl font-black leading-7 text-white uppercase">
                  <div className="bg-white border-2 border-black p-1 shadow-[2px_2px_0_0_#000]">
                    <Star className="h-6 w-6 text-black" strokeWidth={3} aria-hidden="true" />
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-6 flex flex-auto flex-col text-base font-bold leading-7 text-black bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#000]">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

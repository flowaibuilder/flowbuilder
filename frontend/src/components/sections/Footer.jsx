export default function Footer({ content }) {
  return (
    <footer className="bg-black text-white border-t-8 border-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:order-1 md:mt-0 flex flex-col sm:flex-row items-center gap-6 w-full justify-between">
          <div className="bg-secondary text-black font-black uppercase border-4 border-white px-6 py-3 text-xl rotate-[-2deg] shadow-[4px_4px_0_0_#fff]">
            {content.companyName || 'Your Company, Inc'}
          </div>
          <p className="text-center text-sm font-bold leading-5">
            &copy; {new Date().getFullYear()} All rights reserved. <br/> Built with Neo-Brutalism.
          </p>
        </div>
      </div>
    </footer>
  );
}

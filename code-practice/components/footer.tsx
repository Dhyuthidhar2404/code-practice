export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 text-center mt-auto">
      <div className="container mx-auto">
        <p>
          © {new Date().getFullYear()} CodePractice. Built with <span className="text-red-500">❤</span> for coding
          enthusiasts.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <TechIcon icon="react" title="React" />
          <TechIcon icon="js" title="JavaScript" />
          <TechIcon icon="html5" title="HTML5" />
          <TechIcon icon="css3-alt" title="CSS3" />
        </div>
      </div>
    </footer>
  )
}

function TechIcon({ icon, title }: { icon: string; title: string }) {
  return (
    <span
      className="text-gray-500 text-xl hover:text-primary hover:scale-110 transition-all cursor-pointer"
      title={title}
    >
      <i className={`fab fa-${icon}`}></i>
    </span>
  )
}


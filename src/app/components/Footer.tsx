import { Mail, Phone } from "lucide-react";
export function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">DB Learning</h3>
            <p className="text-gray-300">
              Интерактивті сабақтар мен практикалық тапсырмалар арқылы SQL және дерекқорларды меңгеріңіз.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Байланыс</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>contact@dblearn.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+7 (700) 023-4969</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Автор</h4>
            <p className="text-gray-300">Kussainova Malika</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 DB.Learn. Барлық құқықтар қорғалған.</p>
        </div>
      </div>
    </footer>
  );
}

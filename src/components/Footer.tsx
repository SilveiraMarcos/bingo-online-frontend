export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Bingo Paróquia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Pagamentos processados com segurança via Cakto
          </p>
        </div>
      </div>
    </footer>
  );
}

import {
  Wrench, Sparkles, Users, Scissors, PawPrint, Laptop, Car, PartyPopper,
  GraduationCap, Briefcase, HeartPulse, Building2, Truck, ShieldCheck, Trees,
  Zap, Droplets, PaintBucket, Hammer, Square, Snowflake, Key, Brush, Shirt,
  Baby, ChefHat, UserCog, Hand, Palette, HandHeart, Bath, Dog, Stethoscope,
  Smartphone, Wifi, Tv, Refrigerator, BookOpen, Music, Mic, Camera, Video,
  Scale, Calculator, Syringe, Bike, ShoppingBag, PackageCheck, Lock, Eye,
  Waves, Drill, DoorOpen, Lightbulb, Plug, Pipette, Brain, Flower2, Boxes,
  ClipboardList, Sofa, BedDouble, Layers, Cookie, Wine, GlassWater, Ruler,
  ShowerHead, Shield, Megaphone, Globe, FileText, Languages, Pencil, Code,
  TrendingUp, Smile, Heart, Activity, Footprints, ScanFace, Hotel, ArrowUpDown,
  ScrollText, Sun, Box,
  type LucideIcon,
} from "lucide-react";
import type { CategoriaServico, SubcategoriaResolvida, SubcategoriaServico } from "../types/tipos_categorias_servico";

export const CATEGORIAS_SERVICO: CategoriaServico[] = [
  {
    id: "casa-manutencao",
    nome: "Casa e Manutenção",
    icone: Wrench,
    destaque: true,
    subcategorias: [
      // Reparos gerais
      { id: "marido-de-aluguel", nome: "Marido de aluguel", icone: Hammer, grupo: "Reparos gerais", destaque: true },
      { id: "pequenos-reparos", nome: "Pequenos reparos", icone: Wrench, grupo: "Reparos gerais" },
      { id: "instalacao-prateleiras", nome: "Instalação de prateleiras", icone: Layers, grupo: "Reparos gerais" },
      { id: "instalacao-cortinas", nome: "Instalação de cortinas", icone: Square, grupo: "Reparos gerais" },
      { id: "instalacao-suporte-tv", nome: "Instalação de suporte de TV", icone: Tv, grupo: "Reparos gerais" },
      { id: "troca-fechaduras", nome: "Troca de fechaduras", icone: Lock, grupo: "Reparos gerais" },
      { id: "ajuste-portas", nome: "Ajuste de portas", icone: DoorOpen, grupo: "Reparos gerais" },
      { id: "vedacao-janelas", nome: "Vedação de janelas", icone: Square, grupo: "Reparos gerais" },
      { id: "conserto-moveis", nome: "Conserto de móveis", icone: Sofa, grupo: "Reparos gerais" },
      { id: "montador-moveis", nome: "Montador de móveis", icone: Boxes, grupo: "Reparos gerais", destaque: true },
      // Elétrica
      { id: "eletricista", nome: "Eletricista", icone: Zap, grupo: "Elétrica", destaque: true },
      { id: "troca-tomadas", nome: "Troca de tomadas", icone: Plug, grupo: "Elétrica" },
      { id: "troca-interruptores", nome: "Troca de interruptores", icone: Plug, grupo: "Elétrica" },
      { id: "instalacao-chuveiro", nome: "Instalação de chuveiro", icone: ShowerHead, grupo: "Elétrica" },
      { id: "instalacao-ventilador", nome: "Instalação de ventilador de teto", icone: Sun, grupo: "Elétrica" },
      { id: "instalacao-luminarias", nome: "Instalação de luminárias", icone: Lightbulb, grupo: "Elétrica" },
      { id: "quadro-energia", nome: "Quadro de energia", icone: Zap, grupo: "Elétrica" },
      { id: "revisao-eletrica", nome: "Revisão elétrica", icone: ClipboardList, grupo: "Elétrica" },
      { id: "padrao-energia", nome: "Padrão de energia", icone: Zap, grupo: "Elétrica" },
      // Hidráulica
      { id: "encanador", nome: "Encanador", icone: Droplets, grupo: "Hidráulica", destaque: true },
      { id: "vazamentos", nome: "Vazamentos", icone: Droplets, grupo: "Hidráulica" },
      { id: "desentupimento", nome: "Desentupimento", icone: Pipette, grupo: "Hidráulica" },
      { id: "troca-torneira", nome: "Troca de torneira", icone: Droplets, grupo: "Hidráulica" },
      { id: "troca-registro", nome: "Troca de registro", icone: Droplets, grupo: "Hidráulica" },
      { id: "caixa-acoplada", nome: "Caixa acoplada", icone: Droplets, grupo: "Hidráulica" },
      { id: "instalacao-filtro", nome: "Instalação de filtro", icone: Droplets, grupo: "Hidráulica" },
      { id: "instalacao-maquina-lavar", nome: "Instalação de máquina de lavar", icone: Refrigerator, grupo: "Hidráulica" },
      { id: "troca-vaso-sanitario", nome: "Troca de vaso sanitário", icone: Bath, grupo: "Hidráulica" },
      // Pintura
      { id: "pintura-residencial", nome: "Pintura residencial", icone: PaintBucket, grupo: "Pintura", destaque: true },
      { id: "pintura-apartamento", nome: "Pintura de apartamento", icone: PaintBucket, grupo: "Pintura" },
      { id: "pintura-portas", nome: "Pintura de portas", icone: Brush, grupo: "Pintura" },
      { id: "pintura-grades", nome: "Pintura de grades", icone: Brush, grupo: "Pintura" },
      { id: "textura", nome: "Textura", icone: Brush, grupo: "Pintura" },
      { id: "massa-corrida", nome: "Massa corrida", icone: Brush, grupo: "Pintura" },
      { id: "retoque-pintura", nome: "Retoque de pintura", icone: Brush, grupo: "Pintura" },
      // Alvenaria
      { id: "pedreiro", nome: "Pedreiro", icone: Hammer, grupo: "Alvenaria", destaque: true },
      { id: "reforma-banheiro", nome: "Reforma de banheiro", icone: Bath, grupo: "Alvenaria" },
      { id: "reforma-cozinha", nome: "Reforma de cozinha", icone: ChefHat, grupo: "Alvenaria" },
      { id: "assentamento-piso", nome: "Assentamento de piso", icone: Square, grupo: "Alvenaria" },
      { id: "revestimento", nome: "Revestimento", icone: Square, grupo: "Alvenaria" },
      { id: "construcao-parede", nome: "Construção de parede", icone: Square, grupo: "Alvenaria" },
      { id: "reforma-geral", nome: "Reforma geral", icone: Hammer, grupo: "Alvenaria" },
      // Gesso
      { id: "gesseiro", nome: "Gesseiro", icone: Layers, grupo: "Gesso e drywall" },
      { id: "forro-gesso", nome: "Forro de gesso", icone: Layers, grupo: "Gesso e drywall" },
      { id: "drywall", nome: "Drywall", icone: Layers, grupo: "Gesso e drywall" },
      { id: "divisorias", nome: "Divisórias", icone: Layers, grupo: "Gesso e drywall" },
      // Ar-condicionado
      { id: "instalacao-ar-condicionado", nome: "Instalação de ar-condicionado", icone: Snowflake, grupo: "Ar-condicionado", destaque: true },
      { id: "limpeza-ar-condicionado", nome: "Limpeza de ar-condicionado", icone: Snowflake, grupo: "Ar-condicionado", destaque: true },
      { id: "manutencao-ar-condicionado", nome: "Manutenção de ar-condicionado", icone: Snowflake, grupo: "Ar-condicionado" },
      { id: "carga-gas-ar", nome: "Carga de gás", icone: Snowflake, grupo: "Ar-condicionado" },
      // Chaveiro
      { id: "chaveiro", nome: "Chaveiro", icone: Key, grupo: "Chaveiro", destaque: true },
      { id: "abertura-porta", nome: "Abertura de porta", icone: DoorOpen, grupo: "Chaveiro" },
      { id: "copia-chave", nome: "Cópia de chave", icone: Key, grupo: "Chaveiro" },
      { id: "fechadura-digital", nome: "Fechadura digital", icone: Lock, grupo: "Chaveiro" },
      { id: "chave-automotiva", nome: "Chave automotiva", icone: Car, grupo: "Chaveiro" },
    ],
  },
  {
    id: "limpeza-organizacao",
    nome: "Limpeza e Organização",
    icone: Sparkles,
    destaque: true,
    subcategorias: [
      { id: "diarista", nome: "Diarista", icone: Sparkles, grupo: "Residencial", destaque: true },
      { id: "faxina-comum", nome: "Faxina comum", icone: Sparkles, grupo: "Residencial" },
      { id: "faxina-pesada", nome: "Faxina pesada", icone: Sparkles, grupo: "Residencial", destaque: true },
      { id: "limpeza-pos-obra", nome: "Limpeza pós-obra", icone: Brush, grupo: "Residencial", destaque: true },
      { id: "limpeza-pre-mudanca", nome: "Limpeza pré-mudança", icone: Box, grupo: "Residencial" },
      { id: "limpeza-pos-mudanca", nome: "Limpeza pós-mudança", icone: Box, grupo: "Residencial" },
      { id: "limpeza-apartamento", nome: "Limpeza de apartamento", icone: Building2, grupo: "Residencial" },
      { id: "limpeza-cozinha", nome: "Limpeza de cozinha", icone: ChefHat, grupo: "Residencial" },
      { id: "limpeza-banheiro", nome: "Limpeza de banheiro", icone: Bath, grupo: "Residencial" },
      { id: "limpeza-sofa", nome: "Limpeza de sofá", icone: Sofa, grupo: "Especializada", destaque: true },
      { id: "limpeza-colchao", nome: "Limpeza de colchão", icone: BedDouble, grupo: "Especializada" },
      { id: "limpeza-tapete", nome: "Limpeza de tapete", icone: Square, grupo: "Especializada" },
      { id: "limpeza-cortina", nome: "Limpeza de cortina", icone: Square, grupo: "Especializada" },
      { id: "limpeza-carpete", nome: "Limpeza de carpete", icone: Square, grupo: "Especializada" },
      { id: "higienizacao-automotiva", nome: "Higienização automotiva", icone: Car, grupo: "Especializada" },
      { id: "impermeabilizacao-sofa", nome: "Impermeabilização de sofá", icone: Sofa, grupo: "Especializada" },
      { id: "personal-organizer", nome: "Personal organizer", icone: ClipboardList, grupo: "Organização" },
      { id: "organizacao-guarda-roupa", nome: "Organização de guarda-roupa", icone: Shirt, grupo: "Organização" },
      { id: "organizacao-cozinha", nome: "Organização de cozinha", icone: ChefHat, grupo: "Organização" },
      { id: "organizacao-mudanca", nome: "Organização de mudança", icone: Box, grupo: "Organização" },
      { id: "organizacao-escritorio", nome: "Organização de escritório", icone: Briefcase, grupo: "Organização" },
      { id: "lavanderia", nome: "Lavanderia", icone: Shirt, grupo: "Roupas" },
      { id: "passadeira", nome: "Passadeira", icone: Shirt, grupo: "Roupas", destaque: true },
      { id: "costureira", nome: "Costureira", icone: Scissors, grupo: "Roupas" },
      { id: "ajustes-roupa", nome: "Ajustes de roupa", icone: Scissors, grupo: "Roupas" },
    ],
  },
  {
    id: "familia-domesticos",
    nome: "Família e Domésticos",
    icone: Users,
    destaque: true,
    subcategorias: [
      { id: "baba", nome: "Babá", icone: Baby, grupo: "Crianças", destaque: true },
      { id: "baba-folguista", nome: "Babá folguista", icone: Baby, grupo: "Crianças" },
      { id: "baba-noturna", nome: "Babá noturna", icone: Baby, grupo: "Crianças" },
      { id: "acompanhamento-escolar", nome: "Acompanhamento escolar", icone: BookOpen, grupo: "Crianças" },
      { id: "recreacao-infantil", nome: "Recreação infantil", icone: PartyPopper, grupo: "Crianças" },
      { id: "cuidador-idosos", nome: "Cuidador de idosos", icone: HandHeart, grupo: "Idosos", destaque: true },
      { id: "acompanhante-hospitalar", nome: "Acompanhante hospitalar", icone: HeartPulse, grupo: "Idosos" },
      { id: "cuidador-noturno", nome: "Cuidador noturno", icone: HandHeart, grupo: "Idosos" },
      { id: "cuidador-folguista", nome: "Cuidador folguista", icone: HandHeart, grupo: "Idosos" },
      { id: "cozinheira", nome: "Cozinheira", icone: ChefHat, grupo: "Cozinha", destaque: true },
      { id: "cozinheira-diaria", nome: "Cozinheira diária", icone: ChefHat, grupo: "Cozinha" },
      { id: "marmitas-congeladas", nome: "Marmitas congeladas", icone: Cookie, grupo: "Cozinha" },
      { id: "personal-chef", nome: "Personal chef", icone: ChefHat, grupo: "Cozinha" },
      { id: "churrasqueiro", nome: "Churrasqueiro", icone: ChefHat, grupo: "Cozinha" },
      { id: "garcom", nome: "Garçom", icone: Wine, grupo: "Cozinha" },
      { id: "copeira", nome: "Copeira", icone: GlassWater, grupo: "Cozinha" },
    ],
  },
  {
    id: "beleza-bem-estar",
    nome: "Beleza e Bem-estar",
    icone: Scissors,
    destaque: true,
    subcategorias: [
      { id: "cabeleireiro", nome: "Cabeleireiro", icone: Scissors, grupo: "Cabelo", destaque: true },
      { id: "corte-feminino", nome: "Corte feminino", icone: Scissors, grupo: "Cabelo" },
      { id: "corte-masculino", nome: "Corte masculino", icone: Scissors, grupo: "Cabelo" },
      { id: "escova", nome: "Escova", icone: Brush, grupo: "Cabelo" },
      { id: "hidratacao", nome: "Hidratação", icone: Droplets, grupo: "Cabelo" },
      { id: "progressiva", nome: "Progressiva", icone: Brush, grupo: "Cabelo" },
      { id: "coloracao", nome: "Coloração", icone: Palette, grupo: "Cabelo" },
      { id: "mechas", nome: "Mechas", icone: Palette, grupo: "Cabelo" },
      { id: "penteado", nome: "Penteado", icone: Brush, grupo: "Cabelo" },
      { id: "manicure", nome: "Manicure", icone: Hand, grupo: "Unhas", destaque: true },
      { id: "pedicure", nome: "Pedicure", icone: Footprints, grupo: "Unhas" },
      { id: "alongamento-unhas", nome: "Alongamento de unhas", icone: Hand, grupo: "Unhas" },
      { id: "banho-de-gel", nome: "Banho de gel", icone: Hand, grupo: "Unhas" },
      { id: "fibra-vidro", nome: "Fibra de vidro", icone: Hand, grupo: "Unhas" },
      { id: "esmaltacao", nome: "Esmaltação", icone: Hand, grupo: "Unhas" },
      { id: "design-sobrancelhas", nome: "Design de sobrancelhas", icone: Eye, grupo: "Estética", destaque: true },
      { id: "depilacao", nome: "Depilação", icone: Sparkles, grupo: "Estética" },
      { id: "limpeza-pele", nome: "Limpeza de pele", icone: ScanFace, grupo: "Estética" },
      { id: "maquiagem", nome: "Maquiagem", icone: Palette, grupo: "Estética", destaque: true },
      { id: "micropigmentacao", nome: "Micropigmentação", icone: Pencil, grupo: "Estética" },
      { id: "massagem-modeladora", nome: "Massagem modeladora", icone: HandHeart, grupo: "Estética" },
      { id: "drenagem-linfatica", nome: "Drenagem linfática", icone: HandHeart, grupo: "Estética" },
      { id: "massagista", nome: "Massagista", icone: HandHeart, grupo: "Saúde" },
      { id: "fisioterapeuta", nome: "Fisioterapeuta", icone: Activity, grupo: "Saúde" },
      { id: "quiropraxia", nome: "Quiropraxia", icone: Activity, grupo: "Saúde" },
      { id: "pilates", nome: "Pilates", icone: Activity, grupo: "Saúde" },
      { id: "yoga", nome: "Yoga", icone: Smile, grupo: "Saúde" },
      { id: "personal-trainer", nome: "Personal trainer", icone: Activity, grupo: "Saúde" },
      { id: "nutricionista", nome: "Nutricionista", icone: Heart, grupo: "Saúde" },
      { id: "psicologo", nome: "Psicólogo", icone: Brain, grupo: "Saúde" },
      { id: "acupuntura", nome: "Acupuntura", icone: Syringe, grupo: "Saúde" },
    ],
  },
  {
    id: "pet",
    nome: "Pet",
    icone: PawPrint,
    destaque: true,
    subcategorias: [
      { id: "banho-tosa", nome: "Banho e tosa", icone: Bath, destaque: true },
      { id: "tosa-higienica", nome: "Tosa higiênica", icone: Scissors },
      { id: "leva-traz-pet", nome: "Leva e traz pet", icone: PawPrint },
      { id: "dog-walker", nome: "Dog walker", icone: Dog, destaque: true },
      { id: "pet-sitter", nome: "Pet sitter", icone: PawPrint, destaque: true },
      { id: "hospedagem-pet", nome: "Hospedagem pet", icone: Hotel },
      { id: "creche-pet", nome: "Creche pet", icone: PawPrint },
      { id: "adestrador", nome: "Adestrador", icone: Dog },
      { id: "veterinario-domicilio", nome: "Veterinário em domicílio", icone: Stethoscope, destaque: true },
      { id: "taxi-pet", nome: "Táxi pet", icone: Car },
      { id: "vacinacao-pet", nome: "Vacinação pet", icone: Syringe },
      { id: "fisioterapia-pet", nome: "Fisioterapia pet", icone: Activity },
      { id: "fotografia-pet", nome: "Fotografia pet", icone: Camera },
      { id: "entrega-racao", nome: "Entrega de ração", icone: PackageCheck },
    ],
  },
  {
    id: "tecnologia",
    nome: "Tecnologia",
    icone: Laptop,
    subcategorias: [
      { id: "conserto-celular", nome: "Conserto de celular", icone: Smartphone, grupo: "Mobile", destaque: true },
      { id: "troca-tela-celular", nome: "Troca de tela", icone: Smartphone, grupo: "Mobile" },
      { id: "troca-bateria-celular", nome: "Troca de bateria", icone: Smartphone, grupo: "Mobile" },
      { id: "manutencao-notebook", nome: "Manutenção de notebook", icone: Laptop, grupo: "Computador" },
      { id: "formatacao-computador", nome: "Formatação de computador", icone: Laptop, grupo: "Computador" },
      { id: "remocao-virus", nome: "Remoção de vírus", icone: ShieldCheck, grupo: "Computador" },
      { id: "recuperacao-dados", nome: "Recuperação de dados", icone: Laptop, grupo: "Computador" },
      { id: "instalacao-roteador", nome: "Instalação de roteador", icone: Wifi, grupo: "Redes" },
      { id: "configuracao-wifi", nome: "Configuração de Wi-Fi", icone: Wifi, grupo: "Redes" },
      { id: "cabeamento-rede", nome: "Cabeamento de rede", icone: Wifi, grupo: "Redes" },
      { id: "cameras-ip", nome: "Câmeras IP", icone: Camera, grupo: "Redes" },
      { id: "suporte-tecnico-remoto", nome: "Suporte técnico remoto", icone: Laptop, grupo: "Redes" },
      { id: "conserto-geladeira", nome: "Conserto de geladeira", icone: Refrigerator, grupo: "Eletrodomésticos" },
      { id: "conserto-maquina-lavar", nome: "Conserto de máquina de lavar", icone: Refrigerator, grupo: "Eletrodomésticos" },
      { id: "conserto-microondas", nome: "Conserto de micro-ondas", icone: Refrigerator, grupo: "Eletrodomésticos" },
      { id: "conserto-fogao", nome: "Conserto de fogão", icone: ChefHat, grupo: "Eletrodomésticos" },
      { id: "conserto-tv", nome: "Conserto de televisão", icone: Tv, grupo: "Eletrodomésticos" },
    ],
  },
  {
    id: "automotivo",
    nome: "Automotivo",
    icone: Car,
    subcategorias: [
      { id: "mecanico", nome: "Mecânico", icone: Wrench, grupo: "Manutenção", destaque: true },
      { id: "autoeletrica", nome: "Autoelétrica", icone: Zap, grupo: "Manutenção" },
      { id: "troca-oleo", nome: "Troca de óleo", icone: Droplets, grupo: "Manutenção" },
      { id: "revisao-preventiva", nome: "Revisão preventiva", icone: ClipboardList, grupo: "Manutenção" },
      { id: "bateria-auto", nome: "Bateria", icone: Zap, grupo: "Manutenção" },
      { id: "freios", nome: "Freios", icone: Car, grupo: "Manutenção" },
      { id: "suspensao", nome: "Suspensão", icone: Car, grupo: "Manutenção" },
      { id: "alinhamento-balanceamento", nome: "Alinhamento e balanceamento", icone: Car, grupo: "Manutenção" },
      { id: "borracharia", nome: "Borracharia", icone: Car, grupo: "Manutenção" },
      { id: "guincho", nome: "Guincho", icone: Truck, grupo: "Manutenção" },
      { id: "lava-rapido", nome: "Lava-rápido", icone: Droplets, grupo: "Estética", destaque: true },
      { id: "polimento", nome: "Polimento", icone: Sparkles, grupo: "Estética" },
      { id: "cristalizacao", nome: "Cristalização", icone: Sparkles, grupo: "Estética" },
      { id: "vitrificacao", nome: "Vitrificação", icone: Sparkles, grupo: "Estética" },
      { id: "martelinho-ouro", nome: "Martelinho de ouro", icone: Hammer, grupo: "Estética" },
      { id: "insulfilm", nome: "Insulfilm", icone: Square, grupo: "Estética" },
      { id: "despachante", nome: "Despachante", icone: ScrollText, grupo: "Documentos" },
      { id: "transferencia-veiculo", nome: "Transferência de veículo", icone: ScrollText, grupo: "Documentos" },
      { id: "renovacao-cnh", nome: "Renovação de CNH", icone: ScrollText, grupo: "Documentos" },
      { id: "instalacao-rastreador", nome: "Instalação de rastreador", icone: Globe, grupo: "Acessórios" },
      { id: "som-automotivo", nome: "Som automotivo", icone: Music, grupo: "Acessórios" },
      { id: "pelicula-automotiva", nome: "Película automotiva", icone: Square, grupo: "Acessórios" },
    ],
  },
  {
    id: "eventos-festas",
    nome: "Eventos e Festas",
    icone: PartyPopper,
    subcategorias: [
      { id: "cerimonialista", nome: "Cerimonialista", icone: PartyPopper, grupo: "Organização" },
      { id: "assessoria-eventos", nome: "Assessoria de eventos", icone: ClipboardList, grupo: "Organização" },
      { id: "decoracao-eventos", nome: "Decoração", icone: Sparkles, grupo: "Organização" },
      { id: "buffet", nome: "Buffet", icone: ChefHat, grupo: "Organização" },
      { id: "bartender", nome: "Bartender", icone: Wine, grupo: "Organização" },
      { id: "dj", nome: "DJ", icone: Music, grupo: "Entretenimento", destaque: true },
      { id: "banda", nome: "Banda", icone: Music, grupo: "Entretenimento" },
      { id: "musico", nome: "Músico", icone: Music, grupo: "Entretenimento" },
      { id: "animador-infantil", nome: "Animador infantil", icone: PartyPopper, grupo: "Entretenimento" },
      { id: "magico", nome: "Mágico", icone: Sparkles, grupo: "Entretenimento" },
      { id: "fotografo-evento", nome: "Fotógrafo", icone: Camera, grupo: "Entretenimento", destaque: true },
      { id: "filmagem", nome: "Filmagem", icone: Video, grupo: "Entretenimento" },
      { id: "cabine-fotos", nome: "Cabine de fotos", icone: Camera, grupo: "Entretenimento" },
      { id: "aluguel-mesas-cadeiras", nome: "Aluguel de mesas e cadeiras", icone: Square, grupo: "Estrutura" },
      { id: "tendas", nome: "Tendas", icone: Square, grupo: "Estrutura" },
      { id: "som-iluminacao", nome: "Som e iluminação", icone: Lightbulb, grupo: "Estrutura" },
      { id: "brinquedos-inflaveis", nome: "Brinquedos infláveis", icone: PartyPopper, grupo: "Estrutura" },
      { id: "gerador", nome: "Gerador", icone: Zap, grupo: "Estrutura" },
    ],
  },
  {
    id: "educacao-aulas",
    nome: "Educação e Aulas",
    icone: GraduationCap,
    subcategorias: [
      { id: "reforco-escolar", nome: "Reforço escolar", icone: BookOpen, grupo: "Escolar", destaque: true },
      { id: "aulas-matematica", nome: "Matemática", icone: Calculator, grupo: "Escolar" },
      { id: "aulas-portugues", nome: "Português", icone: BookOpen, grupo: "Escolar" },
      { id: "aulas-ingles", nome: "Inglês", icone: Languages, grupo: "Escolar", destaque: true },
      { id: "aulas-redacao", nome: "Redação", icone: Pencil, grupo: "Escolar" },
      { id: "aulas-fisica", nome: "Física", icone: BookOpen, grupo: "Escolar" },
      { id: "aulas-quimica", nome: "Química", icone: BookOpen, grupo: "Escolar" },
      { id: "aulas-biologia", nome: "Biologia", icone: BookOpen, grupo: "Escolar" },
      { id: "aulas-musica", nome: "Música", icone: Music, grupo: "Aulas livres" },
      { id: "aulas-violao", nome: "Violão", icone: Music, grupo: "Aulas livres" },
      { id: "aulas-piano", nome: "Piano", icone: Music, grupo: "Aulas livres" },
      { id: "aulas-canto", nome: "Canto", icone: Mic, grupo: "Aulas livres" },
      { id: "aulas-danca", nome: "Dança", icone: Activity, grupo: "Aulas livres" },
      { id: "aulas-desenho", nome: "Desenho", icone: Pencil, grupo: "Aulas livres" },
      { id: "aulas-fotografia", nome: "Fotografia", icone: Camera, grupo: "Aulas livres" },
      { id: "aulas-informatica", nome: "Informática", icone: Laptop, grupo: "Aulas livres" },
      { id: "preparacao-concurso", nome: "Preparação para concurso", icone: GraduationCap, grupo: "Cursos" },
      { id: "preparacao-enem", nome: "Preparação para ENEM", icone: GraduationCap, grupo: "Cursos" },
      { id: "mentoria-profissional", nome: "Mentoria profissional", icone: TrendingUp, grupo: "Cursos" },
      { id: "aulas-excel", nome: "Excel", icone: Calculator, grupo: "Cursos" },
      { id: "aulas-programacao", nome: "Programação", icone: Code, grupo: "Cursos" },
      { id: "aulas-marketing-digital", nome: "Marketing digital", icone: TrendingUp, grupo: "Cursos" },
    ],
  },
  {
    id: "servicos-profissionais",
    nome: "Serviços Profissionais",
    icone: Briefcase,
    subcategorias: [
      { id: "contador", nome: "Contador", icone: Calculator, grupo: "Negócios", destaque: true },
      { id: "advogado", nome: "Advogado", icone: Scale, grupo: "Negócios", destaque: true },
      { id: "consultor-empresarial", nome: "Consultor empresarial", icone: TrendingUp, grupo: "Negócios" },
      { id: "consultor-financeiro", nome: "Consultor financeiro", icone: TrendingUp, grupo: "Negócios" },
      { id: "social-media", nome: "Social media", icone: Megaphone, grupo: "Marketing" },
      { id: "designer-grafico", nome: "Designer gráfico", icone: Palette, grupo: "Marketing" },
      { id: "gestor-trafego", nome: "Gestor de tráfego", icone: TrendingUp, grupo: "Marketing" },
      { id: "copywriter", nome: "Copywriter", icone: Pencil, grupo: "Marketing" },
      { id: "desenvolvedor-sites", nome: "Desenvolvedor de sites", icone: Code, grupo: "Marketing", destaque: true },
      { id: "certificado-digital", nome: "Certificado digital", icone: ShieldCheck, grupo: "Documentos" },
      { id: "imposto-renda", nome: "Declaração de IR", icone: FileText, grupo: "Documentos" },
      { id: "regularizacao-mei", nome: "Regularização de MEI", icone: FileText, grupo: "Documentos" },
      { id: "abertura-empresa", nome: "Abertura de empresa", icone: Briefcase, grupo: "Documentos" },
      { id: "registro-marca", nome: "Registro de marca", icone: ShieldCheck, grupo: "Documentos" },
      { id: "fotografo-profissional", nome: "Fotógrafo profissional", icone: Camera, grupo: "Comunicação" },
      { id: "editor-video", nome: "Editor de vídeo", icone: Video, grupo: "Comunicação" },
      { id: "criacao-logotipo", nome: "Criação de logotipo", icone: Palette, grupo: "Comunicação" },
      { id: "identidade-visual", nome: "Identidade visual", icone: Palette, grupo: "Comunicação" },
    ],
  },
  {
    id: "saude",
    nome: "Saúde",
    icone: HeartPulse,
    subcategorias: [
      { id: "enfermeiro", nome: "Enfermeiro", icone: Syringe, grupo: "Domiciliar", destaque: true },
      { id: "tecnico-enfermagem", nome: "Técnico de enfermagem", icone: Syringe, grupo: "Domiciliar" },
      { id: "fisioterapeuta-domicilio", nome: "Fisioterapeuta", icone: Activity, grupo: "Domiciliar" },
      { id: "coleta-exames", nome: "Coleta de exames", icone: Pipette, grupo: "Domiciliar" },
      { id: "aplicacao-injecao", nome: "Aplicação de injeção", icone: Syringe, grupo: "Domiciliar" },
      { id: "curativos", nome: "Curativos", icone: Heart, grupo: "Domiciliar" },
      { id: "psicologo-clinico", nome: "Psicólogo", icone: Brain, grupo: "Terapias" },
      { id: "fonoaudiologo", nome: "Fonoaudiólogo", icone: Mic, grupo: "Terapias" },
      { id: "nutricionista-clinico", nome: "Nutricionista", icone: Heart, grupo: "Terapias" },
      { id: "massoterapia", nome: "Massoterapia", icone: HandHeart, grupo: "Terapias" },
      { id: "reiki", nome: "Reiki", icone: HandHeart, grupo: "Terapias" },
    ],
  },
  {
    id: "condominios-empresas",
    nome: "Condomínios e Empresas",
    icone: Building2,
    subcategorias: [
      { id: "limpeza-condominial", nome: "Limpeza condominial", icone: Sparkles, grupo: "Condomínios" },
      { id: "portaria", nome: "Portaria", icone: ShieldCheck, grupo: "Condomínios" },
      { id: "zeladoria", nome: "Zeladoria", icone: UserCog, grupo: "Condomínios" },
      { id: "manutencao-predial", nome: "Manutenção predial", icone: Wrench, grupo: "Condomínios" },
      { id: "dedetizacao", nome: "Dedetização", icone: ShieldCheck, grupo: "Condomínios" },
      { id: "pintura-predial", nome: "Pintura predial", icone: PaintBucket, grupo: "Condomínios" },
      { id: "limpeza-comercial", nome: "Limpeza comercial", icone: Sparkles, grupo: "Empresas" },
      { id: "recepcionista", nome: "Recepcionista", icone: UserCog, grupo: "Empresas" },
      { id: "seguranca", nome: "Segurança", icone: Shield, grupo: "Empresas" },
      { id: "tecnico-informatica", nome: "Técnico de informática", icone: Laptop, grupo: "Empresas" },
      { id: "coffee-break", nome: "Coffee break", icone: ChefHat, grupo: "Empresas" },
    ],
  },
  {
    id: "entregas-mudancas",
    nome: "Entregas e Mudanças",
    icone: Truck,
    destaque: true,
    subcategorias: [
      { id: "motoboy", nome: "Motoboy", icone: Bike, grupo: "Entregas", destaque: true },
      { id: "entrega-rapida", nome: "Entrega rápida", icone: PackageCheck, grupo: "Entregas" },
      { id: "entrega-documentos", nome: "Entrega de documentos", icone: FileText, grupo: "Entregas" },
      { id: "entrega-farmacia", nome: "Entrega de farmácia", icone: PackageCheck, grupo: "Entregas" },
      { id: "entrega-mercado", nome: "Entrega de mercado", icone: ShoppingBag, grupo: "Entregas" },
      { id: "frete-pequeno", nome: "Frete pequeno", icone: Truck, grupo: "Fretes", destaque: true },
      { id: "carreto", nome: "Carreto", icone: Truck, grupo: "Fretes", destaque: true },
      { id: "mudanca-residencial", nome: "Mudança residencial", icone: Truck, grupo: "Fretes", destaque: true },
      { id: "mudanca-comercial", nome: "Mudança comercial", icone: Building2, grupo: "Fretes" },
      { id: "montagem-desmontagem", nome: "Montagem e desmontagem", icone: Drill, grupo: "Fretes" },
      { id: "transporte-moveis", nome: "Transporte de móveis", icone: Sofa, grupo: "Fretes" },
      { id: "ajudante-carga", nome: "Ajudante de carga", icone: ArrowUpDown, grupo: "Fretes" },
    ],
  },
  {
    id: "seguranca",
    nome: "Segurança",
    icone: ShieldCheck,
    subcategorias: [
      { id: "instalacao-cameras", nome: "Instalação de câmeras", icone: Camera, grupo: "Residencial", destaque: true },
      { id: "cerca-eletrica", nome: "Cerca elétrica", icone: Zap, grupo: "Residencial" },
      { id: "alarme-residencial", nome: "Alarme residencial", icone: Shield, grupo: "Residencial" },
      { id: "interfone", nome: "Interfone", icone: Smartphone, grupo: "Residencial" },
      { id: "fechadura-digital-seg", nome: "Fechadura digital", icone: Lock, grupo: "Residencial" },
      { id: "automacao-residencial", nome: "Automação residencial", icone: Globe, grupo: "Residencial" },
      { id: "cftv", nome: "CFTV", icone: Camera, grupo: "Empresarial" },
      { id: "portaria-remota", nome: "Portaria remota", icone: ShieldCheck, grupo: "Empresarial" },
      { id: "monitoramento-24h", nome: "Monitoramento 24h", icone: Eye, grupo: "Empresarial" },
      { id: "controle-facial", nome: "Controle facial", icone: ScanFace, grupo: "Empresarial" },
      { id: "cancela-automatica", nome: "Cancela automática", icone: ArrowUpDown, grupo: "Empresarial" },
    ],
  },
  {
    id: "jardim-piscina",
    nome: "Jardim e Piscina",
    icone: Trees,
    subcategorias: [
      { id: "jardineiro", nome: "Jardineiro", icone: Trees, grupo: "Jardim", destaque: true },
      { id: "poda-arvores", nome: "Poda de árvores", icone: Trees, grupo: "Jardim" },
      { id: "corte-grama", nome: "Corte de grama", icone: Trees, grupo: "Jardim" },
      { id: "paisagismo", nome: "Paisagismo", icone: Flower2, grupo: "Jardim" },
      { id: "plantio", nome: "Plantio", icone: Flower2, grupo: "Jardim" },
      { id: "irrigacao", nome: "Irrigação", icone: Droplets, grupo: "Jardim" },
      { id: "limpeza-terreno", nome: "Limpeza de terreno", icone: Trees, grupo: "Jardim" },
      { id: "limpeza-piscina", nome: "Limpeza de piscina", icone: Waves, grupo: "Piscina", destaque: true },
      { id: "manutencao-piscina", nome: "Manutenção de piscina", icone: Waves, grupo: "Piscina" },
      { id: "tratamento-agua", nome: "Tratamento de água", icone: Droplets, grupo: "Piscina" },
      { id: "troca-bomba-piscina", nome: "Troca de bomba", icone: Wrench, grupo: "Piscina" },
      { id: "aspiracao-piscina", nome: "Aspiração", icone: Waves, grupo: "Piscina" },
    ],
  },
];

// ============ Helpers ============

const MAPA_SUB: Map<string, SubcategoriaResolvida> = (() => {
  const m = new Map<string, SubcategoriaResolvida>();
  for (const cat of CATEGORIAS_SERVICO) {
    for (const sub of cat.subcategorias) {
      m.set(sub.id, { subcategoria: sub, categoria: cat });
    }
  }
  return m;
})();

export function listarCategorias(): CategoriaServico[] {
  return CATEGORIAS_SERVICO;
}

export function listarSubcategorias(): SubcategoriaServico[] {
  return CATEGORIAS_SERVICO.flatMap((c) => c.subcategorias);
}

export function buscarSubcategoria(id: string): SubcategoriaResolvida | null {
  return MAPA_SUB.get(id) ?? null;
}

export function categoriasDestaque(): CategoriaServico[] {
  return CATEGORIAS_SERVICO.filter((c) => c.destaque);
}

export function subcategoriasDestaque(): SubcategoriaResolvida[] {
  const out: SubcategoriaResolvida[] = [];
  for (const cat of CATEGORIAS_SERVICO) {
    for (const sub of cat.subcategorias) {
      if (sub.destaque) out.push({ subcategoria: sub, categoria: cat });
    }
  }
  return out;
}

export function iconePorSlug(slug: string): LucideIcon {
  const sub = MAPA_SUB.get(slug);
  if (sub) return sub.subcategoria.icone;
  const cat = CATEGORIAS_SERVICO.find((c) => c.id === slug);
  if (cat) return cat.icone;
  return Sparkles;
}

export function nomePorSlug(slug: string): string {
  return MAPA_SUB.get(slug)?.subcategoria.nome
    ?? CATEGORIAS_SERVICO.find((c) => c.id === slug)?.nome
    ?? slug;
}

const TODOS_SLUGS = new Set<string>([
  ...CATEGORIAS_SERVICO.map((c) => c.id),
  ...listarSubcategorias().map((s) => s.id),
]);

export function slugValido(slug: string): boolean {
  return TODOS_SLUGS.has(slug);
}

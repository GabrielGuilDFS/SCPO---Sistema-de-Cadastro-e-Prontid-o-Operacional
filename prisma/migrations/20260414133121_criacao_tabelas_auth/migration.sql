-- CreateEnum
CREATE TYPE "perfil_acesso" AS ENUM ('ADMINISTRADOR', 'OPERADOR', 'VISUALIZADOR');

-- CreateTable
CREATE TABLE "login" (
    "id" SERIAL NOT NULL,
    "policial_id" INTEGER NOT NULL,
    "perfil_acesso" "perfil_acesso" NOT NULL,
    "matricula" VARCHAR(50) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "status_ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policial" (
    "id" SERIAL NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,

    CONSTRAINT "policial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_policial_id_key" ON "login"("policial_id");

-- CreateIndex
CREATE UNIQUE INDEX "login_matricula_key" ON "login"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "policial_matricula_key" ON "policial"("matricula");

-- AddForeignKey
ALTER TABLE "login" ADD CONSTRAINT "login_policial_id_fkey" FOREIGN KEY ("policial_id") REFERENCES "policial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

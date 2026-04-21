/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `policial` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `policial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_admissao` to the `policial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_nascimento` to the `policial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rg` to the `policial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone_primario` to the `policial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "cnh_categoria" AS ENUM ('A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE');

-- CreateEnum
CREATE TYPE "grau_hierarquico" AS ENUM ('SOLDADO', 'CABO', 'SARGENTO', 'SUBTENENTE', 'TENENTE', 'CAPITAO', 'MAJOR', 'TENENTE_CORONEL', 'CORONEL');

-- CreateEnum
CREATE TYPE "sexo" AS ENUM ('MASCULINO', 'FEMININO');

-- CreateEnum
CREATE TYPE "tipo_sanguineo" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- CreateEnum
CREATE TYPE "estado_civil" AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO');

-- CreateEnum
CREATE TYPE "escolaridade" AS ENUM ('FUNDAMENTAL', 'MEDIO', 'SUPERIOR', 'POS_GRADUACAO', 'MESTRADO', 'DOUTORADO');

-- AlterTable
ALTER TABLE "policial" ADD COLUMN     "cnh_categoria" "cnh_categoria",
ADD COLUMN     "cnh_numero" VARCHAR(20),
ADD COLUMN     "cpf" CHAR(11) NOT NULL,
ADD COLUMN     "data_admissao" DATE NOT NULL,
ADD COLUMN     "data_nascimento" DATE NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "endereco_id" INTEGER,
ADD COLUMN     "escolaridade" "escolaridade",
ADD COLUMN     "estado_civil" "estado_civil",
ADD COLUMN     "funcao_atual_id" INTEGER,
ADD COLUMN     "grau_hierarquico" "grau_hierarquico",
ADD COLUMN     "idade" INTEGER,
ADD COLUMN     "nome_guerra" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "possui_plano_saude" BOOLEAN DEFAULT false,
ADD COLUMN     "religiosidade" TEXT,
ADD COLUMN     "rg" TEXT NOT NULL,
ADD COLUMN     "sexo" "sexo",
ADD COLUMN     "status" TEXT DEFAULT 'pronto',
ADD COLUMN     "subunidade_id" INTEGER,
ADD COLUMN     "telefone_primario" TEXT NOT NULL,
ADD COLUMN     "telefone_secundario" TEXT,
ADD COLUMN     "tipo_sanguineo" "tipo_sanguineo";

-- CreateTable
CREATE TABLE "subunidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "subunidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcao_atual" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "funcao_atual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endereco" (
    "id" SERIAL NOT NULL,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subunidade_nome_key" ON "subunidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "funcao_atual_nome_key" ON "funcao_atual"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "policial_cpf_key" ON "policial"("cpf");

-- AddForeignKey
ALTER TABLE "policial" ADD CONSTRAINT "policial_endereco_id_fkey" FOREIGN KEY ("endereco_id") REFERENCES "endereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policial" ADD CONSTRAINT "policial_subunidade_id_fkey" FOREIGN KEY ("subunidade_id") REFERENCES "subunidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policial" ADD CONSTRAINT "policial_funcao_atual_id_fkey" FOREIGN KEY ("funcao_atual_id") REFERENCES "funcao_atual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

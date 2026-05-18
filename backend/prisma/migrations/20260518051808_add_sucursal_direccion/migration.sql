-- AlterTable
ALTER TABLE "Sucursal" ADD COLUMN     "abierto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "diasOperacion" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "horarioApertura" TEXT,
ADD COLUMN     "horarioCierre" TEXT,
ADD COLUMN     "telefono" TEXT;

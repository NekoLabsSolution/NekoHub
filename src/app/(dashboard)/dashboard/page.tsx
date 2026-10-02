import { redirect } from "next/navigation";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProducerCard from "./ProducerCard";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  const producer = await prisma.producer.findUnique({
    where: { userId: session.userId },
    select: { chargesEnabled: true, payoutsEnabled: true, kycVerified: true },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        {/* Welcome header */}
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: -0.5 }}
          >
            Bem-vindo ao NekoHub
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sua conta está pronta. Escolha como deseja usar a plataforma.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        {/* Role selection cards */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ justifyContent: "center" }}
        >
          {/* Buyer card */}
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              maxWidth: { sm: 320 },
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardActionArea sx={{ height: "100%", p: 1 }}>
              <CardContent>
                <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
                  <ShoppingBagOutlinedIcon
                    sx={{ fontSize: 40, color: "primary.main" }}
                  />
                  <div>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                      gutterBottom
                    >
                      Explorar e Comprar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Descubra cursos, e-books, assinaturas e muito mais. Compre
                      uma vez e acesse sua biblioteca a qualquer hora.
                    </Typography>
                  </div>
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ fontWeight: 600 }}
                  >
                    COMPRADOR — papel atual
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Producer card */}
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              maxWidth: { sm: 320 },
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <ProducerCard producer={producer} />
          </Card>
        </Stack>

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: "block", textAlign: "center", mt: 4 }}
        >
          ID de sessão: {session.userId.slice(0, 8)}&hellip;
          &nbsp;&middot;&nbsp; Papel: {session.role}
        </Typography>
      </Container>
    </Box>
  );
}

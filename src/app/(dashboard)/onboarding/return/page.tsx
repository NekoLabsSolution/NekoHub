import { redirect } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OnboardingReturnPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const producer = await prisma.producer.findUnique({
    where: { userId: session.userId },
    select: { chargesEnabled: true, payoutsEnabled: true },
  });

  if (!producer) redirect("/dashboard");

  const isActive = producer.chargesEnabled && producer.payoutsEnabled;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
          {isActive ? (
            <CheckCircleOutlineIcon
              sx={{ fontSize: 64, color: "success.main" }}
            />
          ) : (
            <AccessTimeIcon sx={{ fontSize: 64, color: "warning.main" }} />
          )}

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {isActive ? "Cadastro concluído!" : "Cadastro em análise"}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {isActive
              ? "Sua conta de produtor está ativa. Você já pode publicar produtos e receber pagamentos."
              : "O Stripe está analisando suas informações. Você receberá uma notificação quando sua conta for aprovada."}
          </Typography>

          {!isActive && (
            <Alert severity="info" sx={{ width: "100%", textAlign: "left" }}>
              Se precisar adicionar mais informações, clique em &quot;Continuar
              cadastro&quot; abaixo.
            </Alert>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="contained" href="/dashboard">
              Ir para o painel
            </Button>
            {!isActive && (
              <Button variant="outlined" href="/api/stripe/connect/refresh">
                Continuar cadastro
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

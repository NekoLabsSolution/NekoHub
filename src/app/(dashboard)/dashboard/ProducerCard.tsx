"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Alert,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  becomeProducer,
  type ProducerOnboardingState,
} from "@/app/actions/producer";

type ProducerStatus = {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  kycVerified: boolean;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outlined"
      size="small"
      disabled={pending}
      startIcon={
        pending ? <CircularProgress size={14} color="inherit" /> : null
      }
    >
      {pending ? "Aguarde..." : "Tornar-se Produtor"}
    </Button>
  );
}

export default function ProducerCard({
  producer,
}: {
  producer: ProducerStatus;
}) {
  const [state, action] = useActionState<ProducerOnboardingState, FormData>(
    becomeProducer,
    undefined,
  );

  const isActive = producer?.chargesEnabled && producer?.payoutsEnabled;
  const isPending = producer && !isActive;

  return (
    <CardContent>
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <StorefrontOutlinedIcon
          sx={{ fontSize: 40, color: "secondary.main" }}
        />
        <div>
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
            Vender e Ganhar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Publique seus próprios produtos digitais, defina seu preço e receba
            diretamente na sua conta.
          </Typography>
        </div>

        {state?.error && (
          <Alert severity="error" sx={{ width: "100%", py: 0.5 }}>
            {state.error}
          </Alert>
        )}

        {isActive ? (
          <Chip label="Conta ativa" color="success" size="small" />
        ) : isPending ? (
          <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
            <Chip
              label="Cadastro em andamento"
              color="warning"
              size="small"
            />
            <Button
              variant="outlined"
              size="small"
              href="/api/stripe/connect/refresh"
            >
              Continuar cadastro
            </Button>
          </Stack>
        ) : (
          <form action={action}>
            <SubmitButton />
          </form>
        )}
      </Stack>
    </CardContent>
  );
}

"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { signUp } from "@/app/actions/auth";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Logo / brand */}
          <Stack spacing={1} sx={{ alignItems: "center", mb: 4 }}>
            <StorefrontOutlinedIcon
              sx={{ fontSize: 40, color: "primary.main" }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: -0.5 }}
            >
              NekoHub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie sua conta para começar
            </Typography>
          </Stack>

          {/* Global error message */}
          {state?.message && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {state.message}
            </Alert>
          )}

          <form action={action} noValidate>
            <Stack spacing={2.5}>
              {/* Full name */}
              <TextField
                id="fullName"
                name="fullName"
                label="Nome completo"
                autoComplete="name"
                autoFocus
                required
                fullWidth
                error={!!state?.errors?.fullName}
                helperText={state?.errors?.fullName?.[0]}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Email */}
              <TextField
                id="email"
                name="email"
                type="email"
                label="Endereço de e-mail"
                autoComplete="email"
                required
                fullWidth
                error={!!state?.errors?.email}
                helperText={state?.errors?.email?.[0]}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Password */}
              <TextField
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Senha"
                autoComplete="new-password"
                required
                fullWidth
                error={!!state?.errors?.password}
                helperText={
                  state?.errors?.password?.[0] ??
                  "Mín. 8 caracteres, pelo menos uma letra e um número"
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? "Ocultar senha" : "Mostrar senha"
                          }
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Submit */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={pending}
                sx={{ mt: 1, py: 1.5, fontWeight: 600 }}
              >
                {pending ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Criar conta"
                )}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Já tem uma conta?{" "}
            <Link href="/login" underline="hover" sx={{ fontWeight: 500 }}>
              Entrar
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

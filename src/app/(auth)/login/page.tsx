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
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { signIn } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);
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
              Entre na sua conta
            </Typography>
          </Stack>

          {state?.message && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {state.message}
            </Alert>
          )}

          <form action={action} noValidate>
            <Stack spacing={2.5}>
              <TextField
                id="email"
                name="email"
                type="email"
                label="Endereço de e-mail"
                autoComplete="email"
                autoFocus
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

              <TextField
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Senha"
                autoComplete="current-password"
                required
                fullWidth
                error={!!state?.errors?.password}
                helperText={state?.errors?.password?.[0]}
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
                  "Entrar"
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
            Ainda não tem uma conta?{" "}
            <Link href="/signup" underline="hover" sx={{ fontWeight: 500 }}>
              Criar conta
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

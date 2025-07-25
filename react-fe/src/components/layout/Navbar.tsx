import { AppBar, Box, Button, Container, IconButton, Menu, Toolbar, Typography } from '@mui/material';
import { Dispatch, MouseEvent, SetStateAction, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import QuizIcon from '@mui/icons-material/Quiz';
import { RootState } from '../../stores/store';
import { Select } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';

const pages = [
  { title: 'Sign Up', path: '/sign-up' },
  { title: 'Sign In', path: '/sign-in' },
];

const themeOptions = [
  { label: 'Pink', value: 'pink' },
  { label: 'Blue', value: 'blue' },
  { label: 'Purple', value: 'purple' },
  { label: 'Dark', value: 'dark' },
];

type ThemeName = 'pink' | 'blue' | 'purple' | 'dark';
export default function Navbar({ theme, setTheme }: { theme: ThemeName, setTheme: Dispatch<SetStateAction<ThemeName>> }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const game = useSelector((state: RootState) => state.game);
  const muiTheme = useTheme();
  
  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigate = (path: string) => {
    handleCloseNavMenu();
    navigate(path);
  };

  // Get the navbar background color based on the theme
  const getNavbarBackground = () => {
    if (theme === 'dark') return '#272727';
    if (theme === 'blue') return '#1976d2';
    if (theme === 'purple') return '#7B1FA2';
    return '#FF6B95'; // Default pink
  };

  // navbar not shown when a game starts
  if (game.roomCode && game.gameStatus !== "") {
    return null;
  }

  return (
    <AppBar position="static" sx={{ 
      backgroundColor: getNavbarBackground(), 
      zIndex: 1100 
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo and title - desktop */}
          <QuizIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            YIPPEE QUIZ
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page.path} 
                  onClick={() => handleNavigate(page.path)}
                  selected={location.pathname === page.path}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo and title - mobile */}
          <QuizIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            YIPPEE
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                onClick={() => handleNavigate(page.path)}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  fontWeight: location.pathname === page.path ? 'bold' : 'normal',
                  borderBottom: location.pathname === page.path ? '2px solid white' : 'none',
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0, ml: 2 }}>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeName)}
              size="small"
              sx={{ 
                color: 'white', 
                borderColor: 'white', 
                '.MuiOutlinedInput-notchedOutline': { 
                  borderColor: 'white' 
                }, 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: 1, 
                minWidth: 100 
              }}
            >
              {themeOptions.map(opt => (
                <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
import express from 'express';
import mongoose from 'mongoose';

export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('email password').exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  res.send('Logout route');
};

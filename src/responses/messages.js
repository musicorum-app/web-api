module.exports = {
  INTERNAL_ERROR: {
    error: {
      code: 'A#500#001',
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    }
  },

  ENDPOINT_NOT_FOUND: {
    error: {
      code: 'A#404#002',
      message: 'Endpoint not found.',
      error: 'ENDPOINT_NOT_FOUND'
    }
  },

  INVALID_TOKEN: {
    error: {
      code: 'A#401#003',
      message: 'Invalid token.',
      error: 'INVALID_TOKEN'
    }
  },

  MISSING_PARAMETERS: {
    error: {
      code: 'A#400#004',
      message: 'Missing parameters.',
      error: 'MISSING_PARAMETERS'
    }
  },

  INVALID_TOKENID: {
    error: {
      code: 'A#400#005',
      message: 'Invalid tokenId.',
      error: 'INVALID_TOKENID'
    }
  },

  SCHEDULES_LIMIT_REACHED: {
    error: {
      code: 'A#400#006',
      message: 'Schedules limit reached.',
      error: 'SCHEDULES_LIMIT_REACHED'
    }
  },

  SCHEDULE_NOT_FOUND: {
    error: {
      code: 'A#404#007',
      message: 'Schedule not found.',
      error: 'SCHEDULE_NOT_FOUND'
    }
  },

  INVALID_PATCH: {
    error: {
      code: 'A#400#008',
      message: 'Invalid patch.',
      error: 'INVALID_PATCH'
    }
  },
  LATFM_NOT_SIGNED: {
    error: {
      code: 'A#400#009',
      message: 'Account not ssigned with last.fm.',
      error: 'LATFM_NOT_SIGNED'
    }
  },
  NOT_FOUND: {
    error: {
      code: 'A#404#010',
      message: 'Item not found.',
      error: 'NOT_FOUND'
    }
  },
  NOT_IMPLEMENTED: {
    error: {
      code: 'A#501#011',
      message: 'Not yet implemented.',
      error: 'NOT_IMPLEMENTED'
    }
  }
}

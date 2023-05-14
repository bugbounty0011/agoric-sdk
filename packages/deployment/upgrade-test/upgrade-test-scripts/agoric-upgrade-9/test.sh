#!/bin/bash

. ./upgrade-test-scripts/env_setup.sh

# provision pool has right balance 
test_val $(agd query bank balances agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346 -o json | jq -r '.balances | first | .amount ') "19250000"

# ensure PSM IST has only ToyUSD
test_val $(agd q vstorage children published.psm.IST -o json | jq -r '.children | length') "1"
test_val $(agd q vstorage children published.psm.IST -o json | jq -r '.children | first') "ToyUSD"

# Gov params
test_not_val "$(timeout 3 agoric follow -l :published.psm.IST.ToyUSD.governance -o jsonlines | jq -r '.current.MintLimit.value.value')" "0" "PSM MintLimit non-zero"